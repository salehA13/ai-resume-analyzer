"""Pydantic models for request/response schemas."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


# ── Section Models ──────────────────────────────────────────────

class ContactInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    location: str = ""


class Education(BaseModel):
    institution: str
    degree: str
    field: str = ""
    dates: str = ""
    gpa: str = ""


class Experience(BaseModel):
    company: str
    title: str
    dates: str = ""
    highlights: list[str] = []


class ParsedResume(BaseModel):
    raw_text: str
    contact: ContactInfo = ContactInfo()
    summary: str = ""
    education: list[Education] = []
    experience: list[Experience] = []
    skills: list[str] = []
    certifications: list[str] = []


# ── Analysis Models ─────────────────────────────────────────────

class SkillMatch(BaseModel):
    skill: str
    found: bool
    category: str = "general"  # technical, soft, domain


class ATSScore(BaseModel):
    overall: int = Field(..., ge=0, le=100, description="Overall ATS compatibility 0-100")
    formatting: int = Field(..., ge=0, le=100)
    keywords: int = Field(..., ge=0, le=100)
    sections: int = Field(..., ge=0, le=100)
    readability: int = Field(..., ge=0, le=100)
    details: list[str] = []


class Suggestion(BaseModel):
    category: str  # "content", "formatting", "keywords", "impact"
    priority: str  # "high", "medium", "low"
    text: str


class AnalysisResult(BaseModel):
    parsed: ParsedResume
    ats_score: ATSScore
    skill_matches: list[SkillMatch] = []
    suggestions: list[Suggestion] = []
    strengths: list[str] = []
    job_match_score: Optional[int] = Field(None, ge=0, le=100)
    job_title_match: str = ""


# ── Request Models ──────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    job_description: str = ""
    job_title: str = ""


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    mode: str = "mock"
