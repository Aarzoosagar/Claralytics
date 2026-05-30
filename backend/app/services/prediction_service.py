import time
import numpy as np
import pandas as pd
from typing import Any, Dict, List, Optional, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import (
    RandomForestRegressor, GradientBoostingClassifier,
    IsolationForest, RandomForestClassifier
)
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.cluster import KMeans
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    silhouette_score
)
from app.utils.csv_parser import load_dataset
from app.utils.helpers import safe_float
import logging

logger = logging.getLogger(__name__)


def _clean_for_ml(df: pd.DataFrame, feature_cols: Optional[List[str]] = None) -> pd.DataFrame:
    """Select numeric features, fill NaNs, drop constant columns."""
    if feature_cols:
        df = df[feature_cols]
    numeric = df.select_dtypes(include=[np.number])
    # Drop columns that are >80% missing
    numeric = numeric.loc[:, numeric.isnull().mean() < 0.8]
    numeric = numeric.fillna(numeric.median())
    # Drop constant columns
    numeric = numeric.loc[:, numeric.std() > 0]
    return numeric


def _feature_importance(model, feature_names: List[str]) -> Dict[str, float]:
    fi = {}
    if hasattr(model, "feature_importances_"):
        for name, imp in zip(feature_names, model.feature_importances_):
            fi[name] = round(float(imp), 6)
    elif hasattr(model, "coef_"):
        coefs = model.coef_.flatten() if model.coef_.ndim > 1 else model.coef_
        for name, coef in zip(feature_names, coefs):
            fi[name] = round(float(abs(coef)), 6)
    return dict(sorted(fi.items(), key=lambda x: x[1], reverse=True)[:20])


class PredictionService:

    # ─── Regression Forecast ─────────────────────────────────────────────────

    @staticmethod
    def run_forecast(df: pd.DataFrame, target_col: str,
                     feature_cols: Optional[List[str]] = None,
                     periods: int = 30) -> Dict[str, Any]:
        start = time.perf_counter()

        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in dataset")

        features = _clean_for_ml(df.drop(columns=[target_col]), feature_cols)
        target = df[target_col].fillna(df[target_col].median())

        # Align indices
        common_idx = features.index.intersection(target.index)
        X = features.loc[common_idx]
        y = target.loc[common_idx]

        if len(X) < 20:
            raise ValueError("Insufficient rows for forecasting (need ≥ 20)")

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)

        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(X_train_s, y_train)
        y_pred = model.predict(X_test_s)

        mae = safe_float(mean_absolute_error(y_test, y_pred))
        rmse = safe_float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = safe_float(r2_score(y_test, y_pred))

        # Naive future projection: extrapolate using mean of last 30 rows
        last_values = y.tail(periods).values
        trend_factor = (last_values[-1] / last_values[0]) if last_values[0] != 0 else 1
        forecast_values = [
            safe_float(last_values[-1] * (trend_factor ** ((i + 1) / max(len(last_values), 1))))
            for i in range(periods)
        ]

        duration = time.perf_counter() - start
        return {
            "type": "forecast",
            "target_column": target_col,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "forecast_periods": periods,
            "forecast_values": forecast_values,
            "actual_vs_predicted": [
                {"actual": safe_float(a), "predicted": safe_float(p)}
                for a, p in zip(y_test.values[:50], y_pred[:50])
            ],
            "metrics": {"mae": mae, "rmse": rmse, "r2": r2},
            "feature_importance": _feature_importance(model, list(X.columns)),
            "duration_seconds": round(duration, 3),
        }

    # ─── Churn Classification ────────────────────────────────────────────────

    @staticmethod
    def run_churn(df: pd.DataFrame, target_col: str,
                  feature_cols: Optional[List[str]] = None,
                  threshold: float = 0.5) -> Dict[str, Any]:
        start = time.perf_counter()

        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found")

        # Encode target if it's not numeric
        y_raw = df[target_col].dropna()
        if y_raw.dtype == object or str(y_raw.dtype) == "category":
            le = LabelEncoder()
            y = pd.Series(le.fit_transform(y_raw), index=y_raw.index)
            class_labels = le.classes_.tolist()
        else:
            y = y_raw.astype(int)
            class_labels = sorted(y.unique().tolist())

        features = _clean_for_ml(df.drop(columns=[target_col]), feature_cols)
        common_idx = features.index.intersection(y.index)
        X, y = features.loc[common_idx], y.loc[common_idx]

        if len(X) < 20:
            raise ValueError("Insufficient data for classification")

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if y.nunique() <= 10 else None)
        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)

        model = GradientBoostingClassifier(n_estimators=100, random_state=42)
        model.fit(X_train_s, y_train)
        y_pred = model.predict(X_test_s)
        y_prob = model.predict_proba(X_test_s)[:, 1]

        avg = "binary" if y.nunique() == 2 else "weighted"
        metrics = {
            "accuracy": safe_float(accuracy_score(y_test, y_pred)),
            "precision": safe_float(precision_score(y_test, y_pred, average=avg, zero_division=0)),
            "recall": safe_float(recall_score(y_test, y_pred, average=avg, zero_division=0)),
            "f1": safe_float(f1_score(y_test, y_pred, average=avg, zero_division=0)),
        }

        # High-risk customers
        risk_df = pd.DataFrame({"probability": y_prob, "prediction": y_pred})
        high_risk = risk_df[risk_df["probability"] >= threshold]

        duration = time.perf_counter() - start
        return {
            "type": "churn",
            "target_column": target_col,
            "class_labels": class_labels,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "churn_rate_pct": round(float(y.mean() * 100), 2),
            "high_risk_count": len(high_risk),
            "high_risk_pct": round(len(high_risk) / max(len(y_test), 1) * 100, 2),
            "risk_distribution": {
                "low": int((y_prob < 0.3).sum()),
                "medium": int(((y_prob >= 0.3) & (y_prob < threshold)).sum()),
                "high": int((y_prob >= threshold).sum()),
            },
            "metrics": metrics,
            "feature_importance": _feature_importance(model, list(X.columns)),
            "duration_seconds": round(duration, 3),
        }

    # ─── Customer Segmentation ───────────────────────────────────────────────

    @staticmethod
    def run_segmentation(df: pd.DataFrame,
                         feature_cols: Optional[List[str]] = None,
                         n_clusters: int = 4) -> Dict[str, Any]:
        start = time.perf_counter()

        features = _clean_for_ml(df, feature_cols)
        if features.shape[1] == 0:
            raise ValueError("No usable numeric features for segmentation")

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(features)

        # Determine optimal K using elbow if n_clusters=0 (auto)
        k = max(2, min(n_clusters, features.shape[0] // 5))
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(X_scaled)

        sil = safe_float(silhouette_score(X_scaled, labels)) if len(np.unique(labels)) > 1 else None
        inertia = safe_float(model.inertia_)

        # Segment profiles
        features["_segment"] = labels
        profiles = []
        for seg_id in sorted(np.unique(labels)):
            seg = features[features["_segment"] == seg_id].drop(columns=["_segment"])
            profiles.append({
                "segment_id": int(seg_id),
                "size": len(seg),
                "pct": round(len(seg) / len(features) * 100, 1),
                "centroid": {col: safe_float(seg[col].mean()) for col in seg.columns[:10]},
            })
        features.drop(columns=["_segment"], inplace=True)

        duration = time.perf_counter() - start
        return {
            "type": "segmentation",
            "n_clusters": k,
            "total_samples": len(features),
            "segments": profiles,
            "metrics": {"silhouette_score": sil, "inertia": inertia},
            "feature_columns_used": list(features.columns),
            "duration_seconds": round(duration, 3),
        }

    # ─── Anomaly Detection ───────────────────────────────────────────────────

    @staticmethod
    def run_anomaly_detection(df: pd.DataFrame,
                              feature_cols: Optional[List[str]] = None,
                              contamination: float = 0.05) -> Dict[str, Any]:
        start = time.perf_counter()

        features = _clean_for_ml(df, feature_cols)
        if features.shape[1] == 0:
            raise ValueError("No usable numeric features for anomaly detection")

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(features)

        model = IsolationForest(contamination=contamination, random_state=42, n_jobs=-1)
        preds = model.fit_predict(X_scaled)       # -1 = anomaly, 1 = normal
        scores = model.score_samples(X_scaled)    # lower = more anomalous

        anomaly_mask = preds == -1
        anomaly_indices = np.where(anomaly_mask)[0].tolist()

        # Characterize anomalies
        normal_means = features[~anomaly_mask].mean()
        anomaly_means = features[anomaly_mask].mean()
        deviation = ((anomaly_means - normal_means) / normal_means.replace(0, np.nan)).abs()
        top_drivers = deviation.nlargest(5).to_dict()

        duration = time.perf_counter() - start
        return {
            "type": "anomaly_detection",
            "total_samples": len(features),
            "anomaly_count": int(anomaly_mask.sum()),
            "anomaly_pct": round(float(anomaly_mask.mean() * 100), 2),
            "anomaly_indices": anomaly_indices[:200],
            "anomaly_scores": [safe_float(s) for s in scores[anomaly_mask][:50]],
            "top_anomaly_drivers": {k: safe_float(v) for k, v in top_drivers.items()},
            "contamination_used": contamination,
            "feature_columns_used": list(features.columns),
            "duration_seconds": round(duration, 3),
        }