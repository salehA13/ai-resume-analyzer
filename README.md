# 🔍 AI Resume Analyzer

[![CI](https://github.com/salehA13/ai-resume-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/salehA13/ai-resume-analyzer/actions)
![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

> **Upload a resume PDF and get instant AI-powered analysis** — skills extraction, ATS compatibility scoring, job match analysis, and actionable improvement suggestions.

<div align="center">

```
┌──────────────────────────────────────────────────┐
│              AI Resume Analyzer                   │
│                                                   │
│   ┌─────────────────────────────────────────┐    │
│   │         📄 Upload Resume (PDF)           │    │
│   │      Drag & drop or click to browse      │    │
│   └─────────────────────────────────────────┘    │
│                                                   │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│   │ ATS  │ │Format│ │ Keys │ │ Sect │ │ Read │ │
│   │  78  │ │  85  │ │  72  │ │  90  │ │  80  │ │
│   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
│                                                   │
│   Skills: ✅ Python  ✅ React  ❌ Kubernetes      │
│                                                   │
│   💡 Suggestions  ·  ✅ Strengths  ·  📊 Match   │
└──────────────────────────────────────────────────┘
```

</div>

## ✨ Features

- **📄 PDF Upload** — Drag-and-drop or click to upload your resume
- **🔍 Text Extraction** — Parses sections: contact, education, experience, skills, certifications
- **📊 ATS Scoring** — Rates formatting, keywords, sections, and readability (0-100)
- **🎯 Skills Gap Analysis** — Matches your skills against job descriptions
- **💡 Improvement Suggestions** — Prioritized, actionable recommendations
- **🏆 Strengths** — Highlights what's already working well
- **🤖 AI-Powered** — Uses OpenAI GPT for deep analysis (works in mock mode without API key)
- **🐳 Docker Ready** — One-command deployment with Docker Compose

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────────────────────────┐
│   Browser    │  HTTP   │         FastAPI Backend          │
│  React +     │────────▶│                                  │
│  Tailwind    │◀────────│  ┌──────────┐  ┌─────────────┐ │
│  TypeScript  │  JSON   │  │  Parser   │  │  Analyzer   │ │
└─────────────┘         │  │ (PyMuPDF) │  │ (OpenAI/    │ │
                         │  └──────────┘  │  Mock)       │ │
                         │                 └─────────────┘ │
                         │  ┌──────────┐                    │
                         │  │  Scorer   │ ATS Scoring       │
                         │  └──────────┘                    │
                         └─────────────────────────────────┘
```

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React 18 + Vite + Tailwind CSS | Modern, responsive UI |
| Backend | FastAPI + Python 3.12 | REST API, PDF processing |
| PDF | PyMuPDF | Text extraction from PDF |
| AI | OpenAI GPT-4o-mini | Skills analysis & suggestions |
| Infra | Docker Compose + GitHub Actions | Container deployment + CI |

## 🚀 Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/salehA13/ai-resume-analyzer.git
cd ai-resume-analyzer
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

### Local Development

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for live AI analysis. Without it, the app runs in **mock mode** with realistic demo data. |

## 📡 API Reference

### `POST /api/analyze`

Upload a resume PDF for analysis.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | PDF resume (max 10 MB) |
| `job_description` | string | No | Target job description for matching |
| `job_title` | string | No | Target job title |

**Response:** `200 OK`

```json
{
  "parsed": {
    "contact": { "name": "John Doe", "email": "john@example.com", ... },
    "summary": "Senior software engineer with 8+ years...",
    "education": [{ "institution": "MIT", "degree": "B.S. Computer Science", ... }],
    "experience": [{ "company": "Google", "title": "Senior SWE", "highlights": [...] }],
    "skills": ["Python", "React", "AWS", ...],
    "certifications": ["AWS Solutions Architect"]
  },
  "ats_score": {
    "overall": 78,
    "formatting": 85,
    "keywords": 72,
    "sections": 90,
    "readability": 80,
    "details": ["✅ Name found", "✅ Experience section (3 entries)", ...]
  },
  "skill_matches": [
    { "skill": "Python", "found": true, "category": "technical" },
    { "skill": "Kubernetes", "found": false, "category": "technical" }
  ],
  "suggestions": [
    { "category": "content", "priority": "high", "text": "Add quantifiable achievements..." }
  ],
  "strengths": ["Strong technical skill set..."],
  "job_match_score": 82,
  "job_title_match": "Senior Software Engineer"
}
```

### `GET /health`

Health check endpoint.

```json
{ "status": "ok", "version": "1.0.0", "mode": "mock" }
```

## 🧪 Testing

```bash
cd backend
python -m pytest tests/ -v
```

## 📁 Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── routes/
│   │   │   ├── analyze.py       # POST /api/analyze
│   │   │   └── health.py        # GET /health
│   │   ├── services/
│   │   │   ├── parser.py        # PDF text extraction + section parsing
│   │   │   ├── analyzer.py      # AI analysis (OpenAI / mock)
│   │   │   └── scorer.py        # ATS compatibility scoring
│   │   └── models/
│   │       └── schemas.py       # Pydantic request/response models
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application
│   │   ├── components/
│   │   │   ├── UploadZone.tsx   # Drag-and-drop file upload
│   │   │   ├── AnalysisResults.tsx  # Full results display
│   │   │   ├── SkillsChart.tsx  # Skills match visualization
│   │   │   └── ScoreCard.tsx    # Circular score indicator
│   │   └── services/
│   │       └── api.ts           # API client
│   ├── package.json
│   └── Dockerfile
├── .github/workflows/ci.yml    # CI pipeline
├── docker-compose.yml
├── README.md
└── LICENSE
```

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **Backend:** Python 3.12, FastAPI, Pydantic v2, PyMuPDF, OpenAI SDK
- **Infrastructure:** Docker, Docker Compose, GitHub Actions CI
- **Design:** Glass morphism UI, gradient accents, responsive layout

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">
  <sub>Built by <a href="https://github.com/salehA13">@salehA13</a></sub>
</div>
