import json
import logging
from typing import Any, Dict, List, Optional

from groq import Groq

from app.config import get_settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# AI CLIENT
# ─────────────────────────────────────────────

def _get_client():

    settings = get_settings()

    print(
        "GROQ_API_KEY =",
        settings.GROQ_API_KEY
    )

    # GROQ
    if settings.GROQ_API_KEY:

        try:

            client = Groq(
                api_key=settings.GROQ_API_KEY
            )

            logger.info(
                "Groq client initialized successfully"
            )

            return client, "groq"

        except Exception as e:

            logger.warning(
                f"Groq client init failed: {e}"
            )

    # OPENAI FALLBACK
    if settings.OPENAI_API_KEY:

        try:

            from openai import OpenAI

            client = OpenAI(
                api_key=settings.OPENAI_API_KEY
            )

            logger.info(
                "OpenAI client initialized successfully"
            )

            return client, "openai"

        except ImportError:

            logger.warning(
                "openai package not installed"
            )

        except Exception as e:

            logger.warning(
                f"OpenAI init failed: {e}"
            )

    return None, None


# ─────────────────────────────────────────────
# FALLBACK
# ─────────────────────────────────────────────

def _fallback_insight() -> str:

    return (
        "AI insights are currently unavailable. "
        "Please verify GROQ_API_KEY or OPENAI_API_KEY."
    )


# ─────────────────────────────────────────────
# CHAT WRAPPER
# ─────────────────────────────────────────────

def _chat(
    messages: List[Dict],
    max_tokens: int = 1024
) -> str:

    client, provider = _get_client()

    if client is None:
        return _fallback_insight()

    settings = get_settings()

    model = (
        settings.AI_MODEL
        if provider == "groq"
        else "gpt-4o-mini"
    )

    try:

        response = client.chat.completions.create(

            model=model,

            messages=messages,

            max_tokens=max_tokens,

            temperature=0.4,
        )

        content = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        logger.info(
            "AI response generated successfully"
        )

        return content

    except Exception as e:

        logger.warning(
            f"AI API call failed: {e}"
        )

        return _fallback_insight()


# ─────────────────────────────────────────────
# AI SERVICE
# ─────────────────────────────────────────────

class AIService:

    # ─────────────────────────────────────────
    # GENERATE INSIGHTS
    # ─────────────────────────────────────────

    @staticmethod
    def generate_insights(
        analytics_summary: Dict[str, Any]
    ) -> Dict[str, Any]:

        context = json.dumps({

            "overview":
                analytics_summary.get(
                    "overview", {}
                ),

            "quality":
                analytics_summary.get(
                    "quality", {}
                ),

            "top_correlations":
                analytics_summary.get(
                    "correlations", {}
                ).get(
                    "strongly_positive", []
                ),

            "outlier_summary": [

                {
                    "column": o["column"],
                    "outlier_pct":
                        o["outlier_pct"]
                }

                for o in analytics_summary.get(
                    "outliers", []
                )[:5]
            ],

        }, indent=2)

        system_prompt = """
You are an elite Business Intelligence Analyst, Data Scientist, Management Consultant, and Domain Discovery Expert.

Your task is to analyze the supplied dataset analytics and return ONLY valid JSON.

STRICT RULES:

1. Return ONLY a valid JSON object.
2. Do NOT return markdown.
3. Do NOT return explanations.
4. Do NOT return code blocks.
5. Do NOT return text before or after the JSON.
6. Do NOT invent facts, metrics, percentages, trends, correlations, industries, entities, or business context.
7. Use ONLY the supplied analytics.
8. If evidence is insufficient, explicitly state uncertainty.
9. Detect the dataset domain automatically from the provided analytics.
10. Every insight must be supported by the available analysis.

Possible domains include:
- Sales Analytics
- Retail Analytics
- Financial Analytics
- Banking Analytics
- Customer Analytics
- Marketing Analytics
- Human Resource Analytics
- Healthcare Analytics
- Manufacturing Analytics
- Supply Chain Analytics
- Education Analytics
- Sports Analytics
- Cricket Analytics
- E-Commerce Analytics
- General Data Analytics

If the domain cannot be confidently identified:
Domain = General Data Analytics

ANALYSIS OBJECTIVES:

Analyze:
- Dataset overview
- Data quality
- Statistical patterns
- Significant trends
- Correlations
- Outliers
- Forecast insights
- Predictive model results
- Potential risks
- Potential opportunities

Return ONLY the following JSON structure:

{
  "domain": "string",
  "executive_summary": "string",
  "key_insights": [
    "string"
  ],
  "risks": [
    "string"
  ],
  "opportunities": [
    "string"
  ],
  "strategic_recommendations": [
    "string"
  ],
  "data_narrative": "string",
  "confidence_level": "High | Medium | Low"
}

FIELD REQUIREMENTS:

executive_summary:
- Concise overview of the dataset findings.
- 3 to 5 sentences.

key_insights:
- 5 to 10 specific observations.
- Based only on supplied analytics.

risks:
- Data-supported concerns only.
- Empty array if none identified.

opportunities:
- Data-supported opportunities only.
- Empty array if none identified.

strategic_recommendations:
- Actionable recommendations.
- Directly supported by findings.

data_narrative:
- Explain the overall story revealed by the data.

confidence_level:
- High = strong evidence
- Medium = partial evidence
- Low = limited evidence

Return ONLY valid JSON.
"""

        messages = [

            {
                "role": "system",
                "content": system_prompt
            },

            {
                "role": "user",
                "content":
                    f"Dataset Analytics:\n{context}"
            },
        ]

        response = _chat(messages)

        logger.info(
            f"RAW AI RESPONSE: {response}"
        )

        # ─────────────────────────────────────
        # CLEAN RESPONSE
        # ─────────────────────────────────────

        cleaned = (
            response
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # ─────────────────────────────────────
        # PARSE JSON
        # ─────────────────────────────────────

        try:

            parsed = json.loads(cleaned)

            return parsed

        except Exception as e:

            logger.warning(
                f"JSON parse failed: {e}"
            )

            return {

                "executive_summary":
                    "AI response received successfully.",

                "key_insights": [
                    cleaned
                ],

                "risks": [],

                "opportunities": [],

                "strategic_recommendations": [],

                "data_narrative":
                    cleaned,
            }

    # ─────────────────────────────────────────
    # AI CHAT
    # ─────────────────────────────────────────

    @staticmethod
    def chat(
        messages: List[Dict[str, str]],
        dataset_context: Optional[str] = None
    ) -> str:

        system_content = """
You are Claralytics AI, an advanced Data Analyst, Business Intelligence Consultant,
Machine Learning Expert, Statistician, and Decision Support Assistant integrated into
an AI-powered analytics platform.

Your primary goal is to help users understand, analyze, and make decisions from data.

CAPABILITIES:

- Explain datasets and columns
- Perform statistical interpretation
- Identify trends and patterns
- Detect anomalies and outliers
- Interpret machine learning results
- Explain predictions
- Analyze correlations
- Explain forecasts
- Compare segments and performance
- Generate business insights
- Suggest data-driven recommendations
- Explain visualizations and dashboards

RULES:

1. Base responses only on the provided dataset context.
2. Never invent facts, metrics, trends, or conclusions.
3. If information is unavailable, clearly state that.
4. Explain technical concepts in simple language when appropriate.
5. Keep recommendations actionable and supported by data.
6. Do not assume business context unless supported by dataset columns.
7. When discussing ML models, explain both strengths and limitations.
8. Highlight important risks, opportunities, and anomalies when detected.
9. Be objective, evidence-based, and professional.
10. Focus on insights that help decision-making.

RESPONSE STYLE:

- Clear and concise
- Professional but easy to understand
- Insightful and practical
- Data-driven
- Business-oriented when applicable
- Technical when required

Always prioritize accuracy over assumptions.
"""

        if dataset_context:

            system_content += (
                f"\n\nDataset Context:\n"
                f"{dataset_context}"
            )

        full_messages = [

            {
                "role": "system",
                "content": system_content
            }

        ] + messages

        return _chat(
            full_messages,
            max_tokens=1024
        )

    # ─────────────────────────────────────────
    # REPORT SUMMARY
    # ─────────────────────────────────────────
    @staticmethod
    def generate_report_summary(
        analysis_context: Dict
    ) -> str:

        messages = [
    {
        "role": "system",
        "content": """
You are an elite Business Intelligence Analyst, Data Scientist,
Management Consultant, and Executive Reporting Specialist.

Your task is to generate a professional analytical report using ONLY
the supplied dataset analysis.

STRICT RULES:

1. Use ONLY supplied data.
2. Never invent facts, metrics, percentages, trends, correlations, or business context.
3. Never assume an industry unless clearly supported by dataset columns.
4. Every conclusion must be supported by available analysis.
5. If evidence is insufficient, explicitly state:
   "Insufficient data available to determine."
6. Do not generate generic insights.
7. Do not create fake opportunities or risks.
8. Remain objective and evidence-based.

DOMAIN DETECTION:

Automatically identify the most likely dataset domain:

- Sales Analytics
- Retail Analytics
- Financial Analytics
- Banking Analytics
- Customer Analytics
- Marketing Analytics
- Human Resource Analytics
- Healthcare Analytics
- Manufacturing Analytics
- Supply Chain Analytics
- Education Analytics
- Sports Analytics
- Cricket Analytics
- E-Commerce Analytics
- General Data Analytics

If domain cannot be identified confidently:

Domain = General Data Analytics

ANALYZE:

- Dataset overview
- Data quality
- Statistical patterns
- Trends
- Correlations
- Outliers
- Forecast results (if available)
- Machine learning results (if available)
- Risks
- Opportunities

Generate the report in the following format:

# Executive Summary

Provide a concise executive-level overview of the most important findings.

# Dataset Overview

Include:
- Domain detected
- Dataset characteristics
- Data quality observations

# Key Findings

Provide 5-10 evidence-based findings.

Focus on:
- Significant trends
- Correlations
- Outliers
- Performance indicators
- Forecast observations
- Model insights

# Opportunities

Identify data-supported opportunities.

If none exist:
"Insufficient evidence to identify opportunities."

# Risks & Concerns

Identify:

- Negative trends
- Volatility
- Outliers
- Forecast risks
- Data limitations

If none exist:
"No major risks identified."

# Recommendations

Provide actionable recommendations directly supported by the findings.

Each recommendation should:
- Reference findings
- Explain expected impact
- Be practical and measurable

# Strategic Conclusion

Summarize:
- Overall dataset health
- Major strengths
- Key concerns
- Suggested next focus areas

STYLE:

- Executive-level consulting tone
- Professional and concise
- Data-driven
- Evidence-based
- Suitable for PDF reports and stakeholder presentations
- No speculation
- No marketing language
"""
    },
    {
        "role": "user",
        "content": json.dumps(
            analysis_context,
            indent=2,
            default=str
        )
    }
]

        return _chat(
            messages,
            max_tokens=1200
        )
    # ─────────────────────────────────────────
    # EXPLAIN PREDICTIONS
    # ─────────────────────────────────────────

    @staticmethod
    def explain_prediction(
        prediction_result: Dict[str, Any]
    ) -> str:

        messages = [
    {
        "role": "system",
        "content": """
You are an expert Machine Learning Consultant, Data Scientist,
and Business Intelligence Advisor.

Your task is to explain prediction results in a clear,
business-friendly, and actionable manner.

STRICT RULES:

1. Use ONLY the supplied prediction results.
2. Never invent values, probabilities, metrics, or conclusions.
3. Never exaggerate model performance.
4. If confidence is low, clearly mention uncertainty.
5. Explain results in plain language.
6. Avoid unnecessary technical jargon.
7. Focus on business impact and decision-making.
8. If model metrics are available, explain what they mean.
9. If feature importance is available, explain the most influential factors.
10. If forecasting data is available, explain future expectations and risks.

ANALYZE:

- Prediction outcome
- Confidence level
- Model performance metrics
- Feature importance
- Forecast trends
- Risk indicators
- Business implications

GENERATE:

# Prediction Summary

Explain the prediction in simple language.

# Key Drivers

Explain the most influential factors behind the prediction.

# Confidence Assessment

Explain prediction reliability based on available metrics.

# Business Impact

Describe potential implications of the prediction.

# Risks

Highlight concerns or uncertainties.

# Recommended Actions

Provide practical recommendations based on the prediction.

STYLE:

- Professional
- Easy to understand
- Business-oriented
- Actionable
- Evidence-based
- Concise but informative
"""
    },
    {
        "role": "user",
        "content": json.dumps(
            prediction_result,
            indent=2,
            default=str
        )
    }
]

        return _chat(
            messages,
            max_tokens=500
        )