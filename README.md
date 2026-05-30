#  Claralytics

### AI-Powered Automated Data Analytics Platform

Claralytics is a full-stack AI-powered analytics platform that enables users to upload datasets, perform automated data analysis, generate machine learning predictions, create professional PDF reports, and interact with their data through a conversational AI assistant.

Built using **FastAPI, React, Machine Learning, Groq LLMs, SQLAlchemy, and ReportLab**, Claralytics transforms raw datasets into actionable business insights in minutes.

---

#  Features

##  Dataset Management

* Upload CSV datasets
* Automatic dataset profiling
* Dataset overview statistics
* Data quality assessment
* Missing value detection
* Duplicate analysis

---

##  Advanced Analytics

Automatically generates:

* Dataset Summary
* Statistical Analysis
* Data Quality Score
* KPI Metrics
* Correlation Analysis
* Trend Detection
* Anomaly Detection

---

##  AI Insights Engine

Powered by Groq LLMs.

Generate:

* Executive Summaries
* Business Recommendations
* Strategic Insights
* Risk Analysis
* Opportunity Detection
* Natural Language Explanations

---

##  AI Data Chat

Chat directly with your dataset.

Example queries:

* "What trends do you see?"
* "Which region has highest churn?"
* "Explain customer behavior."
* "Give business recommendations."

---

##  Machine Learning Predictions

Supports automated:

* Classification
* Regression
* Feature Importance Analysis
* Model Evaluation
* Prediction Insights

Metrics generated:

* Accuracy
* Precision
* Recall
* F1 Score
* R² Score
* MAE
* RMSE

---

##  Automated PDF Reports

Generate enterprise-grade reports containing:

* Executive Summary
* Dataset Overview
* KPI Analysis
* AI Insights
* Prediction Results
* Data Quality Scorecards
* Business Recommendations

---

##  Authentication System

* JWT Authentication
* User Registration
* Secure Login
* Protected Routes

---

#  System Architecture

```text
React Frontend
      │
      ▼
FastAPI Backend
      │
 ┌────┴────┐
 ▼         ▼
SQLite   Groq AI
Database  LLM
      │
      ▼
Analytics Engine
      │
      ▼
PDF Report Generator
```

#  Tech Stack

## Frontend

* React.js
* Vite
* Axios
* React Router
* Tailwind CSS
* Lucide Icons

## Backend

* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Uvicorn

## Data Science

* Pandas
* NumPy
* Scikit-learn

## AI

* Groq API
* Llama 3.3 70B

## Reporting

* ReportLab

## Database

* SQLite
* PostgreSQL (Production Ready)

# Project Structure

```text
claralytics/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── utils/
│   │
│   ├── app/uploads/
│   ├── app/reports/
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

#  Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/claralytics.git
cd claralytics
```

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

#  Environment Variables

Create a `.env` file inside backend:

```env
APP_NAME=Claralytics
APP_VERSION=1.0.0

SECRET_KEY=your_secret_key

DATABASE_URL=sqlite:///./claralytics.db

GROQ_API_KEY=your_groq_api_key

AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

# 🚀 Deployment

## Frontend

Deploy on:

* Vercel
* Netlify

## Backend

Deploy on:

* Render
* Railway
* AWS
* Azure

## Database

Recommended:

* PostgreSQL
* Neon
* Supabase

# 📈 Future Enhancements

* Real-time Analytics
* Dashboard Builder
* Drag-and-Drop BI Reports
* Forecasting Engine
* Multi-user Collaboration
* Scheduled Report Generation
* Data Warehouse Integration
* Power BI Integration
* Tableau Integration

#  Academic Value

Claralytics demonstrates concepts from:

* Artificial Intelligence
* Machine Learning
* Data Analytics
* Business Intelligence
* Natural Language Processing
* Full Stack Development
* Software Engineering

##  Live Deployment

### Frontend

[Claralytics Frontend](https://claralytics.onrender.com)

### Backend API

[Claralytics Backend API](https://claralytics-api.onrender.com)

### API Documentation

[Swagger Docs](https://claralytics-api.onrender.com/docs)

### ReDoc Documentation

[ReDoc API Docs](https://claralytics-api.onrender.com/redoc)

### Health Check

[Backend Health Endpoint](https://claralytics-api.onrender.com/health)

#  Author

**Aarzoo Sagar**

B.Tech Artificial Intelligence & Machine Learning

---

## ⭐ If you like this project, please star the repository.
