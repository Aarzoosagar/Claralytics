# Claralytics — Frontend

Enterprise analytics SaaS platform frontend built with React 18, Vite, Tailwind CSS, and Recharts.

## Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- Claralytics FastAPI backend running at `http://localhost:8000`

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Configure your backend URL in .env
# Edit VITE_API_URL if your backend runs on a different port

# 4. Start development server
npm run dev
