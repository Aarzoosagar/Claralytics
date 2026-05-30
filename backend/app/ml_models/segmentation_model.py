"""
Segmentation Model — KMeans with elbow-method auto-K and rich cluster profiling.
"""
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score
from typing import Dict, List, Any, Optional
from app.utils.helpers import safe_float


def find_optimal_k(X_scaled: np.ndarray, k_range=(2, 9)) -> int:
    """Simple elbow heuristic: pick K where inertia delta drops below 15%."""
    inertias = []
    ks = list(range(k_range[0], min(k_range[1] + 1, X_scaled.shape[0])))
    for k in ks:
        km = KMeans(n_clusters=k, random_state=42, n_init=5)
        km.fit(X_scaled)
        inertias.append(km.inertia_)
    if len(inertias) < 2:
        return ks[0]
    for i in range(1, len(inertias)):
        pct_drop = (inertias[i - 1] - inertias[i]) / max(inertias[i - 1], 1)
        if pct_drop < 0.15:
            return ks[i - 1]
    return ks[-1]


class SegmentationModel:
    def __init__(self, n_clusters: int = 0, auto_k: bool = True):
        self.n_clusters = n_clusters
        self.auto_k = auto_k and (n_clusters == 0)
        self.scaler = StandardScaler()
        self.model: Optional[KMeans] = None
        self.labels_: Optional[np.ndarray] = None

    def fit(self, df: pd.DataFrame) -> "SegmentationModel":
        X = self.scaler.fit_transform(df.values)
        k = find_optimal_k(X) if self.auto_k else max(2, self.n_clusters)
        self.model = KMeans(n_clusters=k, random_state=42, n_init=10)
        self.labels_ = self.model.fit_predict(X)
        return self

    def get_profiles(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        profiles = []
        for seg_id in sorted(np.unique(self.labels_)):
            seg_df = df.iloc[self.labels_ == seg_id]
            profiles.append({
                "segment_id": int(seg_id),
                "size": len(seg_df),
                "pct": round(len(seg_df) / len(df) * 100, 1),
                "centroid": {col: safe_float(seg_df[col].mean()) for col in seg_df.columns[:15]},
                "label": f"Segment {seg_id + 1}",
            })
        return profiles

    def evaluate(self, df: pd.DataFrame) -> Dict[str, Optional[float]]:
        X = self.scaler.transform(df.values)
        labels = self.labels_
        if len(np.unique(labels)) < 2:
            return {"silhouette_score": None, "davies_bouldin_score": None, "inertia": safe_float(self.model.inertia_)}
        return {
            "silhouette_score": safe_float(silhouette_score(X, labels, sample_size=min(5000, len(X)))),
            "davies_bouldin_score": safe_float(davies_bouldin_score(X, labels)),
            "inertia": safe_float(self.model.inertia_),
            "n_clusters": int(self.model.n_clusters),
        }