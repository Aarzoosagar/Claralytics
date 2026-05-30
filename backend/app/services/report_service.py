import os
import time
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, Optional, List
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from app.config import get_settings
from app.utils.helpers import generate_unique_filename
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

# Brand colours
BRAND_BLUE = colors.HexColor("#1A56DB")
BRAND_DARK = colors.HexColor("#111827")
BRAND_GRAY = colors.HexColor("#6B7280")
BRAND_LIGHT = colors.HexColor("#F3F4F6")
BRAND_GREEN = colors.HexColor("#10B981")
BRAND_RED = colors.HexColor("#EF4444")


def _ensure_reports_dir() -> Path:
    p = Path(settings.REPORTS_DIR)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "ClaraTitle", parent=styles["Title"],
        textColor=BRAND_BLUE, fontSize=24, spaceAfter=6, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "ClaraH2", parent=styles["Heading2"],
        textColor=BRAND_DARK, fontSize=14, spaceBefore=12, spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "ClaraBody", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=BRAND_DARK,
    ))
    styles.add(ParagraphStyle(
        "ClaraMeta", parent=styles["Normal"],
        fontSize=9, textColor=BRAND_GRAY, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "ClaraInsight", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=BRAND_DARK,
        backColor=colors.HexColor("#EFF6FF"),
        borderPadding=(6, 8, 6, 8),
    ))
    return styles


def _kv_table(rows: List[List[str]], col_widths=None) -> Table:
    col_widths = col_widths or [80 * mm, 80 * mm]
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), BRAND_LIGHT),
        ("TEXTCOLOR", (0, 0), (0, -1), BRAND_DARK),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, BRAND_LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D1D5DB")),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


class ReportService:

    @staticmethod
    def generate_pdf(
        title: str,
        overview: Dict[str, Any],
        analytics: Dict[str, Any],
        quality: Dict[str, Any],
        kpis: Dict[str, Any],
        ai_summary: str,
        predictions: Optional[Dict[str, Any]] = None,
        user_name: str = "Analyst",
        dataset_name: str = "Dataset",
    ) -> str:
        """Build a full PDF report and return the file path."""
        reports_dir = _ensure_reports_dir()
        filename = generate_unique_filename(f"{title.replace(' ', '_')}.pdf")
        file_path = reports_dir / filename

        doc = SimpleDocTemplate(
            str(file_path), pagesize=A4,
            leftMargin=20 * mm, rightMargin=20 * mm,
            topMargin=20 * mm, bottomMargin=20 * mm,
        )

        styles = _build_styles()
        story = []

        # ── Cover ────────────────────────────────────────────────────────────
        story.append(Spacer(1, 20 * mm))
        story.append(Paragraph("CLARALYTICS", ParagraphStyle(
            "brand", fontSize=11, textColor=BRAND_BLUE, alignment=TA_CENTER,
            fontName="Helvetica-Bold", spaceAfter=2
        )))
        story.append(Paragraph(title, styles["ClaraTitle"]))
        story.append(Spacer(1, 3 * mm))
        story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_BLUE))
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph(
            f"Dataset: {dataset_name}  •  Prepared for: {user_name}  •  {datetime.now().strftime('%B %d, %Y')}",
            styles["ClaraMeta"]
        ))
        story.append(Spacer(1, 15 * mm))

        # ── AI Executive Summary ─────────────────────────────────────────────
        story.append(Paragraph("Executive Summary", styles["ClaraH2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=BRAND_GRAY))
        story.append(Spacer(1, 3 * mm))
        story.append(Paragraph(ai_summary or "No AI summary available.", styles["ClaraInsight"]))
        story.append(Spacer(1, 8 * mm))

        # ── Dataset Overview ─────────────────────────────────────────────────
        story.append(Paragraph("Dataset Overview", styles["ClaraH2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=BRAND_GRAY))
        story.append(Spacer(1, 3 * mm))
        ov_rows = [
            ["Metric", "Value"],
            ["Total Rows", f"{overview.get('rows', 'N/A'):,}"],
            ["Total Columns", str(overview.get('columns', 'N/A'))],
            ["Missing Values", f"{overview.get('missing_values', 0):,} ({overview.get('missing_pct', 0):.1f}%)"],
            ["Duplicate Rows", f"{overview.get('duplicates', 0):,}"],
            ["Memory Usage", f"{overview.get('memory_usage_mb', 0):.2f} MB"],
        ]
        story.append(_kv_table(ov_rows))
        story.append(Spacer(1, 8 * mm))

        # ── Data Quality ──────────────────────────────────────────────────────
        story.append(Paragraph("Data Quality Assessment", styles["ClaraH2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=BRAND_GRAY))
        story.append(Spacer(1, 3 * mm))
        q_rows = [
    ["Quality Metric", "Value"],
    [
        "Overall Quality Score",
        f"{quality.get('quality_score', 0):.1f}/100"
    ],
    [
        "Missing Data Severity",
        str(
            quality.get(
                "missing_severity",
                "N/A"
            )
        ).upper()
    ],
    [
        "Duplicate Severity",
        str(
            quality.get(
                "duplicate_severity",
                "N/A"
            )
        ).upper()
    ],
]
        for issue in quality.get("issues", [])[:4]:
            q_rows.append([issue.get("type", "").replace("_", " ").title(), issue.get("detail", "")])
        story.append(_kv_table(q_rows))

        if quality.get("recommendations"):
            story.append(Spacer(1, 4 * mm))
            story.append(Paragraph("Recommendations:", ParagraphStyle(
                "rechead", fontSize=10, fontName="Helvetica-Bold", textColor=BRAND_DARK
            )))
            for rec in quality["recommendations"]:
                story.append(Paragraph(f"• {rec}", styles["ClaraBody"]))
        story.append(Spacer(1, 8 * mm))

        # ── KPI Summary ────────────────────────────────────────────────────────
        if kpis:
            story.append(Paragraph("KPI Summary", styles["ClaraH2"]))
            story.append(HRFlowable(width="100%", thickness=0.5, color=BRAND_GRAY))
            story.append(Spacer(1, 3 * mm))
            kpi_rows = [["KPI", "Value"]]
            for k, v in list(kpis.items())[:12]:
                kpi_rows.append([str(k).replace("_", " ").title(), str(v)])
            story.append(_kv_table(kpi_rows))
            story.append(Spacer(1, 8 * mm))

        # ── Predictions ────────────────────────────────────────────────────────
        if predictions:
            story.append(PageBreak())
            story.append(Paragraph("Machine Learning Predictions", styles["ClaraH2"]))
            story.append(HRFlowable(width="100%", thickness=0.5, color=BRAND_GRAY))
            story.append(Spacer(1, 3 * mm))
            for pred_type, pred_data in predictions.items():
                story.append(Paragraph(pred_type.replace("_", " ").title(), ParagraphStyle(
                    "predhead", fontSize=11, fontName="Helvetica-Bold", spaceBefore=6
                )))
                metrics = pred_data.get("metrics", {})
                if metrics:
                    m_rows = [["Metric", "Score"]]
                    for mk, mv in metrics.items():
                        if mv is not None:
                            m_rows.append([mk.upper().replace("_", " "), f"{mv:.4f}" if isinstance(mv, float) else str(mv)])
                    story.append(_kv_table(m_rows, col_widths=[60 * mm, 60 * mm]))
                story.append(Spacer(1, 6 * mm))

        # ── Footer note ────────────────────────────────────────────────────────
        story.append(Spacer(1, 10 * mm))
        story.append(HRFlowable(width="100%", thickness=0.5, color=BRAND_GRAY))
        story.append(Paragraph(
            f"Generated by Claralytics Analytics Platform  •  {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}",
            styles["ClaraMeta"]
        ))

        doc.build(story)
        logger.info(f"Report generated: {file_path}")
        return str(file_path)