"""
Churn Model — binary/multiclass classification wrapper.
Uses Gradient Boosting with calibrated probability outputs.
"""
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score
)
from typing import Dict, Optional
from app.utils.helpers import safe_float


class ChurnModel:
    def __init__(self, calibrate: bool = True):
        base = GradientBoostingClassifier(n_estimators=150, max_depth=4, random_state=42)
        self.model = CalibratedClassifierCV(base, cv=3) if calibrate else base
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.classes_ = None

    def fit(self, X, y) -> "ChurnModel":
        Xs = self.scaler.fit_transform(X)
        self.model.fit(Xs, y)
        self.classes_ = np.unique(y)
        self.is_fitted = True
        return self

    def predict(self, X):
        return self.model.predict(self.scaler.transform(X))

    def predict_proba(self, X):
        return self.model.predict_proba(self.scaler.transform(X))

    def evaluate(self, X, y) -> Dict[str, Optional[float]]:
        preds = self.predict(X)
        probs = self.predict_proba(X)
        avg = "binary" if len(self.classes_) == 2 else "weighted"
        metrics = {
            "accuracy": safe_float(accuracy_score(y, preds)),
            "precision": safe_float(precision_score(y, preds, average=avg, zero_division=0)),
            "recall": safe_float(recall_score(y, preds, average=avg, zero_division=0)),
            "f1": safe_float(f1_score(y, preds, average=avg, zero_division=0)),
        }
        try:
            auc_y = probs[:, 1] if len(self.classes_) == 2 else probs
            metrics["roc_auc"] = safe_float(roc_auc_score(
                y, auc_y,
                multi_class="ovr" if len(self.classes_) > 2 else "raise",
                average="weighted" if len(self.classes_) > 2 else None,
            ))
        except Exception:
            metrics["roc_auc"] = None
        return metrics