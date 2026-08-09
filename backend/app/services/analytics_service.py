import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Any
from app.utils.helpers import safe_float
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:

    # ─────────────────────────────────────────────────────────────
    # DATASET OVERVIEW
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def get_overview(
        df: pd.DataFrame
    ) -> Dict[str, Any]:

        total_cells = (
            df.shape[0] *
            max(df.shape[1], 1)
        )

        missing = int(
            df.isnull()
            .sum()
            .sum()
        )

        duplicate_count = int(
            df.duplicated()
            .sum()
        )

        missing_pct = round(
            (
                missing /
                max(total_cells, 1)
            ) * 100,
            2
        )

        memory_usage_bytes = int(
            df.memory_usage(
                deep=True
            ).sum()
        )

        return {

            "rows":
                int(df.shape[0]),

            "columns":
                int(df.shape[1]),

            "missing_values":
                missing,

            "missing_pct":
                missing_pct,

            "duplicate_count":
                duplicate_count,

            "memory_usage_bytes":
                memory_usage_bytes,
        }

    # ─────────────────────────────────────────────────────────────
    # COLUMN ANALYSIS
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def get_column_analysis(
        df: pd.DataFrame
    ) -> Dict[str, Any]:

        numeric_cols = df.select_dtypes(
            include=[np.number]
        ).columns.tolist()

        categorical_cols = df.select_dtypes(
            include=["object", "category"]
        ).columns.tolist()

        datetime_cols = df.select_dtypes(
            include=["datetime64"]
        ).columns.tolist()

        boolean_cols = df.select_dtypes(
            include=["bool"]
        ).columns.tolist()

        return {

            "numeric_columns":
                numeric_cols,

            "categorical_columns":
                categorical_cols,

            "datetime_columns":
                datetime_cols,

            "boolean_columns":
                boolean_cols,

            "total_numeric":
                len(numeric_cols),

            "total_categorical":
                len(categorical_cols),
        }

    # ─────────────────────────────────────────────────────────────
    # DESCRIPTIVE STATISTICS
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def get_descriptive_stats(
        df: pd.DataFrame
    ) -> List[Dict[str, Any]]:

        numeric_df = df.select_dtypes(
            include=[np.number]
        )

        results = []

        for column in numeric_df.columns:

            series = numeric_df[
                column
            ].dropna()

            if len(series) == 0:
                continue

            mode_val = series.mode()

            results.append({

                "column":
                    column,

                "mean":
                    safe_float(
                        series.mean()
                    ),

                "median":
                    safe_float(
                        series.median()
                    ),

                "mode":
                    safe_float(
                        mode_val.iloc[0]
                    ) if not mode_val.empty else None,

                "std":
                    safe_float(
                        series.std()
                    ),

                "variance":
                    safe_float(
                        series.var()
                    ),

                "min":
                    safe_float(
                        series.min()
                    ),

                "max":
                    safe_float(
                        series.max()
                    ),

                "p25":
                    safe_float(
                        series.quantile(0.25)
                    ),

                "p75":
                    safe_float(
                        series.quantile(0.75)
                    ),

                "p95":
                    safe_float(
                        series.quantile(0.95)
                    ),

                "p99":
                    safe_float(
                        series.quantile(0.99)
                    ),

                "skewness":
                    safe_float(
                        series.skew()
                    ),

                "kurtosis":
                    safe_float(
                        series.kurtosis()
                    ),
            })

        return results

    # ─────────────────────────────────────────────────────────────
    # CORRELATIONS
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def get_correlations(
        df: pd.DataFrame
    ) -> Dict[str, Any]:

        numeric_df = df.select_dtypes(
            include=[np.number]
        )

        if numeric_df.shape[1] < 2:

            return {

                "matrix": {},

                "strongest_positive": [],

                "strongest_negative": [],

                "highly_correlated_pairs": [],
            }

        corr = numeric_df.corr(
            method="pearson"
        )

        matrix = {

            col: {

                c: safe_float(
                    corr.loc[col, c]
                )

                for c in corr.columns
            }

            for col in corr.index
        }

        pairs = []

        cols = list(corr.columns)

        for i in range(len(cols)):

            for j in range(i + 1, len(cols)):

                val = safe_float(
                    corr.iloc[i, j]
                )

                if val is None:
                    continue

                pairs.append({

                    "col_a":
                        cols[i],

                    "col_b":
                        cols[j],

                    "correlation":
                        val,
                })

        sorted_pairs = sorted(

            pairs,

            key=lambda x:
                abs(
                    x["correlation"]
                ),

            reverse=True
        )

        strongest_positive = [

            p for p in sorted_pairs

            if p["correlation"] > 0

        ][:5]

        strongest_negative = [

            p for p in sorted_pairs

            if p["correlation"] < 0

        ][:5]

        highly_correlated_pairs = [

            p for p in sorted_pairs

            if abs(
                p["correlation"]
            ) >= 0.7

        ][:10]

        return {

            "matrix":
                matrix,

            "strongest_positive":
                strongest_positive,

            "strongest_negative":
                strongest_negative,

            "highly_correlated_pairs":
                highly_correlated_pairs,
        }

    # ─────────────────────────────────────────────────────────────
    # OUTLIER DETECTION
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def get_outliers(
        df: pd.DataFrame
    ) -> List[Dict[str, Any]]:

        outliers = []

        numeric_df = df.select_dtypes(
            include=[np.number]
        )

        for column in numeric_df.columns:

            series = numeric_df[
                column
            ].dropna()

            if len(series) == 0:
                continue

            # =====================================================
            # IQR METHOD
            # =====================================================

            q1 = series.quantile(0.25)

            q3 = series.quantile(0.75)

            iqr = q3 - q1

            lower_iqr = (
                q1 - 1.5 * iqr
            )

            upper_iqr = (
                q3 + 1.5 * iqr
            )

            iqr_mask = (

                (series < lower_iqr)

                |

                (series > upper_iqr)
            )

            iqr_count = int(
                iqr_mask.sum()
            )

            outliers.append({

                "column":
                    column,

                "method":
                    "iqr",

                "outlier_count":
                    iqr_count,

                "outlier_pct":
                    round(
                        (
                            iqr_count /
                            len(series)
                        ) * 100,
                        2
                    ),

                "lower_bound":
                    safe_float(
                        lower_iqr
                    ),

                "upper_bound":
                    safe_float(
                        upper_iqr
                    ),
            })

            # =====================================================
            # Z-SCORE METHOD
            # =====================================================

            mean = series.mean()

            std = series.std()

            if std == 0:
                continue

            z_scores = np.abs(
                (
                    series - mean
                ) / std
            )

            z_mask = z_scores > 3

            z_count = int(
                z_mask.sum()
            )

            outliers.append({

                "column":
                    column,

                "method":
                    "zscore",

                "outlier_count":
                    z_count,

                "outlier_pct":
                    round(
                        (
                            z_count /
                            len(series)
                        ) * 100,
                        2
                    ),

                "lower_bound":
                    safe_float(
                        mean - 3 * std
                    ),

                "upper_bound":
                    safe_float(
                        mean + 3 * std
                    ),
            })

        logger.info(
            f"Generated {len(outliers)} outlier checks"
        )

        return outliers

    # ─────────────────────────────────────────────────────────────
    # DATA QUALITY
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def get_quality(
        df: pd.DataFrame
    ) -> Dict[str, Any]:

        total_cells = (
            df.shape[0] *
            max(df.shape[1], 1)
        )

        missing_values = int(
            df.isnull()
            .sum()
            .sum()
        )

        duplicate_rows = int(
            df.duplicated()
            .sum()
        )

        missing_pct = round(
            (
                missing_values /
                max(total_cells, 1)
            ) * 100,
            2
        )

        quality_score = max(

            0,

            round(

                100

                -

                (
                    missing_pct * 0.7
                )

                -

                (
                    duplicate_rows * 0.05
                ),

                2
            )
        )

        recommendations = []

        if missing_values > 0:

            recommendations.append({

                "severity":
                    "medium",

                "message":
                    "Dataset contains missing values.",
            })

        if duplicate_rows > 0:

            recommendations.append({

                "severity":
                    "low",

                "message":
                    "Dataset contains duplicate rows.",
            })

        if quality_score > 90:

            status = "Excellent"

        elif quality_score > 70:

            status = "Good"

        elif quality_score > 50:

            status = "Moderate"

        else:

            status = "Poor"

        return {

            "quality_score":
                quality_score,

            "status":
                status,

            "missing_values":
                missing_values,

            "missing_percentage":
                missing_pct,

            "duplicate_rows":
                duplicate_rows,

            "recommendations":
                recommendations,
        }