"""
Anomaly Model — Isolation Forest + Local Outlier Factor ensemble.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, Optional
from app.utils.helpers import safe_float


class AnomalyModel:
    def __init__(self, contamination: float = 0.05, use_lof: bool = False):
        self.contamination = contamination
        self.use_lof = use_lof
        self.scaler = StandardScaler()
        self.iso = IsolationForest(contamination=contamination, random_state=42, n_jobs=-1)
        self.lof = LocalOutlierFactor(contamination=contamination, novelty=True) if use_lof else None
        self.is_fitted = False

    def fit(self, X) -> "AnomalyModel":
        Xs = self.scaler.fit_transform(X)
        self.iso.fit(Xs)
        if self.lof:
            self.lof.fit(Xs)
        self.is_fitted = True
        return self

    def predict(self, X) -> np.ndarray:
        """Return -1 for anomalies, 1 for normal."""
        Xs = self.scaler.transform(X)
        iso_preds = self.iso.predict(Xs)
        if not self.lof:
            return iso_preds
        lof_preds = self.lof.predict(Xs)
        # Ensemble: flag as anomaly only if both agree
        return np.where((iso_preds == -1) & (lof_preds == -1), -1, 1)

    def score_samples(self, X) -> np.ndarray:
        """Lower = more anomalous."""
        return self.iso.score_samples(self.scaler.transform(X))

    def get_anomaly_summary(self, X_df) -> Dict[str, Any]:
        """Return structured anomaly summary."""
        preds = self.predict(X_df.values)
        scores = self.score_samples(X_df.values)
        mask = preds == -1
        return {
            "total": len(preds),
            "anomaly_count": int(mask.sum()),
            "anomaly_pct": round(float(mask.mean() * 100), 2),
            "mean_anomaly_score": safe_float(scores[mask].mean()) if mask.any() else None,
            "anomaly_indices": np.where(mask)[0].tolist(),
        }