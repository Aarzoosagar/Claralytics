"""
Forecast Model — time-series-aware regression wrapper.
Provides a scikit-learn RandomForest + linear trend blending approach
suitable for business forecasting without external dependencies.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any, List, Optional, Tuple
from app.utils.helpers import safe_float


def create_lag_features(series: pd.Series, lags: List[int] = [1, 2, 3, 7, 14]) -> pd.DataFrame:
    """Generate lag features from a target series."""
    df = pd.DataFrame({"target": series})
    for lag in lags:
        df[f"lag_{lag}"] = series.shift(lag)
    df["rolling_mean_3"] = series.rolling(3).mean()
    df["rolling_std_3"] = series.rolling(3).std()
    df["trend"] = np.arange(len(series))
    return df.dropna()


class ForecastModel:
    def __init__(self, method: str = "rf"):
        self.method = method
        self.model = (
            RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
            if method == "rf"
            else GradientBoostingRegressor(n_estimators=150, random_state=42)
        )
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit(self, X: np.ndarray, y: np.ndarray) -> "ForecastModel":
        Xs = self.scaler.fit_transform(X)
        self.model.fit(Xs, y)
        self.is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(self.scaler.transform(X))

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Optional[float]]:
        preds = self.predict(X)
        return {
            "mae": safe_float(mean_absolute_error(y, preds)),
            "rmse": safe_float(np.sqrt(mean_squared_error(y, preds))),
            "r2": safe_float(r2_score(y, preds)),
        }

    @property
    def feature_importances_(self):
        return getattr(self.model, "feature_importances_", None)