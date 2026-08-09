# Claralytics

### AI-Powered Analytics SaaS Platform

Claralytics is a full-stack analytics platform that transforms raw datasets into actionable insights through automated data analysis, machine learning, interactive visualizations, report generation, and AI-powered explanations.

The application combines a React frontend, FastAPI backend, Python analytics/ML pipeline, and production deployment on AWS EC2.

---

## 🚀 Live Demo

### 🌐 Application

**[Open Claralytics](http://16.16.203.163)**

### ❤️ Backend Health Check

**[API Health Check](http://16.16.203.163/health)**

> Claralytics is currently deployed on an AWS EC2 Ubuntu instance and served through Nginx. The EC2 public IP may change if the instance is stopped and restarted.

---

## ✨ Features

- User registration and authentication
- JWT-based authentication
- Dataset upload
- Automated data analysis
- Statistical summaries
- Correlation analysis
- Interactive dashboards
- Feature importance analysis
- Anomaly detection
- Churn analysis
- Forecasting
- Data segmentation
- AI-powered analytical insights
- Report generation
- Downloadable reports
- REST API backend
- Production deployment on AWS EC2

---

## 🧠 AI-Powered Analytics

Claralytics integrates Groq with Llama 3.3 70B to convert analytical results into human-readable insights.

```text
Dataset
   ↓
Pandas / Scikit-learn
   ↓
Analytics & ML
   ↓
Structured Results
   ↓
Groq / Llama 3.3 70B
   ↓
AI-Generated Insights
```

---

## 🏗️ Architecture

```text
                         INTERNET
                            │
                            ▼
                    AWS EC2 INSTANCE
                    Ubuntu Linux
                            │
                            ▼
                         NGINX
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
             React Frontend     FastAPI
               dist/            :8000
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                      SQLite               AI Layer
                                              │
                                             Groq
                                              │
                                        Llama 3.3 70B
```

### Production Request Flow

```text
User Browser
     ↓
EC2 Public IP :80
     ↓
Nginx
     ├── React Frontend
     │
     └── FastAPI Backend
             ↓
          SQLite
             ↓
        Analytics / ML
             ↓
        AI Insights
```

---

## ☁️ AWS Deployment

Claralytics is deployed on Amazon EC2 using Ubuntu Linux.

### AWS / Cloud Technologies

| Technology      | Purpose                      |
| --------------- | ---------------------------- |
| Amazon EC2      | Application hosting          |
| Amazon VPC      | Network infrastructure       |
| Security Groups | Firewall and traffic control |
| Ubuntu Linux    | Server operating system      |
| Nginx           | Web server and reverse proxy |
| systemd         | FastAPI service management   |
| SSH             | Secure server administration |
| SCP             | Application file transfer    |

### Deployment Architecture

```text
Local Development
       ↓
     GitHub
       ↓
   SCP / Git
       ↓
   AWS EC2
       ↓
    Ubuntu
       ↓
 Python Virtual Environment
       ↓
 FastAPI + Uvicorn
       ↓
    systemd
       ↓
     Nginx
       ↓
 Public Application
```

---

## 🛠️ Tech Stack

### Frontend

* React 18
* Vite
* React Router
* Tailwind CSS
* Axios
* TanStack React Query
* Zustand
* Recharts
* React Hook Form
* Zod
* React Dropzone
* React Markdown
* Lucide React

### Backend

* Python 3.12
* FastAPI
* Uvicorn
* SQLAlchemy
* Alembic
* Pydantic
* Pydantic Settings
* JWT Authentication

### Data & Machine Learning

* Pandas
* NumPy
* SciPy
* Scikit-learn
* OpenPyXL
* ReportLab

### AI

* Groq API
* Llama 3.3 70B

### Cloud & DevOps

* Amazon EC2
* Amazon VPC
* Security Groups
* Ubuntu Linux
* Nginx
* systemd
* SSH
* SCP
* Git

---

## 📊 Analytics & Machine Learning

Claralytics provides multiple analytical capabilities:

### Statistical Analytics

* Dataset summaries
* Numerical analysis
* Categorical analysis
* Correlation analysis
* Data validation

### Machine Learning

* Anomaly detection
* Customer churn analysis
* Forecasting
* Data segmentation
* Feature importance
* Predictive analytics

### Visualization

* KPI cards
* Correlation heatmaps
* Forecast charts
* Segmentation charts
* Feature importance charts
* Interactive analytics dashboards

---

## 📄 Reports

Claralytics can generate analytical reports based on processed datasets and analysis results.

Reports can be downloaded for further analysis and sharing.

---

## 📁 Project Structure

```text
Claralytics/
│
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   ├── ml_models/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── runtime.txt
│   └── render.yaml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── router/
│   │   └── store/
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── deploy/
│   ├── setup_ec2.sh
│   ├── nginx.conf
│   ├── claralytics-api.service
│   ├── iam-policy.json
│   ├── cloudwatch-agent-config.json
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites

* Python 3.10+
* Node.js 18+
* npm
* Git

### Clone

```bash
git clone https://github.com/Aarzoosagar/Claralytics.git
cd Claralytics
```

---

## 🐍 Backend Setup

```bash
cd backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Configure the required environment variables.

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

## ⚛️ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🏭 Production Build

```bash
npm run build
```

The production files are generated in:

```text
frontend/dist/
```

---

## 🔐 Security

The application follows basic deployment security practices:

* JWT-based authentication
* Environment variables for configuration
* Secrets excluded from Git
* SSH-based EC2 administration
* Security Group controlled network access
* FastAPI running behind Nginx
* systemd-managed backend service
* No hard-coded AWS credentials

### Never commit

```text
.env
*.pem
*.key
venv/
node_modules/
dist/
*.db
```

---

## 🧪 API Health Check

The backend provides:

```http
GET /health
```

Example response:

```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

Production:

**[http://16.16.203.163/health](http://16.16.203.163/health)**

---

## 🔧 Why These Technologies?

### FastAPI

FastAPI was selected for:

* High-performance REST APIs
* Automatic OpenAPI documentation
* Pydantic validation
* Python ML ecosystem integration
* Async support

### React

React provides a component-based architecture for building the interactive analytics dashboard.

### Nginx

Nginx is used as:

* Static frontend server
* Reverse proxy
* Public HTTP entry point
* Foundation for future HTTPS configuration

### systemd

systemd manages the FastAPI backend as a persistent Linux service.

### Amazon EC2

EC2 provides control over:

* Operating system
* Networking
* Security
* Python environment
* Application processes
* Web server configuration

---

## 📝 Deployment Challenges Solved

### EC2 SSH Connectivity

Configured secure SSH access using an EC2 key pair and Security Group rules.

### Python Environment

Created an isolated Python virtual environment on Ubuntu.

### Backend Process Management

Configured FastAPI to run as a persistent systemd service.

### Nginx Reverse Proxy

Configured Nginx to serve the React production build and proxy API requests to FastAPI.

### Linux File Permissions

Resolved Nginx permission issues when serving frontend files from the Ubuntu user's home directory by moving the production build to:

```text
/var/www/claralytics
```

### Production Frontend

Built the React application using Vite and served the generated production files through Nginx.

---

## 📌 Current Deployment Status

| Component          | Status       |
| ------------------ | ------------ |
| React Frontend     | ✅ Deployed   |
| FastAPI Backend    | ✅ Deployed   |
| AWS EC2            | ✅ Running    |
| Ubuntu             | ✅ Configured |
| Nginx              | ✅ Configured |
| systemd            | ✅ Configured |
| Security Group     | ✅ Configured |
| SQLite             | ✅ Connected  |
| AI Integration     | ✅ Configured |
| Production Build   | ✅ Complete   |
| Public Application | ✅ Live       |

---

## 🔮 Future Improvements

The current deployment intentionally keeps the infrastructure simple.

Planned improvements include:

* [ ] Amazon S3 for dataset/report storage
* [ ] IAM Instance Role
* [ ] Amazon RDS
* [ ] CloudWatch Logs
* [ ] CloudWatch Metrics
* [ ] HTTPS / TLS
* [ ] Application Load Balancer
* [ ] Auto Scaling
* [ ] CI/CD pipeline
* [ ] Production database migration
* [ ] CDN integration
* [ ] Scalable production architecture

---

## 🗺️ Roadmap

* [x] React frontend
* [x] FastAPI backend
* [x] Authentication
* [x] Dataset upload
* [x] Data analytics
* [x] Machine learning workflows
* [x] Interactive dashboards
* [x] AI-generated insights
* [x] Report generation
* [x] AWS EC2 deployment
* [x] Ubuntu server configuration
* [x] Nginx reverse proxy
* [x] systemd service
* [x] Production frontend build
* [ ] S3 integration
* [ ] IAM role integration
* [ ] CloudWatch monitoring
* [ ] HTTPS
* [ ] CI/CD
* [ ] Scalable production architecture

---

## 💡 What This Project Demonstrates

### Full-Stack Development

React, state management, routing, API integration, visualization, authentication and production builds.

### Backend Engineering

FastAPI, REST APIs, JWT authentication, SQLAlchemy, database integration, file processing and service architecture.

### Data & AI

Pandas, NumPy, SciPy, Scikit-learn, forecasting, segmentation, anomaly detection and LLM-powered insights.

### Cloud & DevOps

AWS EC2, VPC, Security Groups, Ubuntu, SSH, Nginx, systemd and production deployment.

---

## 👩‍💻 Author

### Aarzoo Sagar

B.Tech | AI/ML & Software Engineering

Interested in:

* Artificial Intelligence
* Machine Learning
* Data Analytics
* Backend Development
* Cloud Computing
* AWS
* Software Engineering

---

## 🔗 Links

**GitHub:**
[https://github.com/Aarzoosagar/Claralytics](https://github.com/Aarzoosagar/Claralytics)

**Live Application:**
[http://16.16.203.163](http://16.16.203.163)

**API Health:**
[http://16.16.203.163/health](http://16.16.203.163/health)

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐.
