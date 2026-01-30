"""AI-powered resume analysis — supports OpenAI live mode and realistic mock mode."""

from __future__ import annotations

import json
import os
import random
from typing import Any

from app.models.schemas import ParsedResume, SkillMatch, Suggestion


def _use_mock() -> bool:
    return not os.getenv("OPENAI_API_KEY")


# ── Mock Analysis ───────────────────────────────────────────────

_TECHNICAL_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "FastAPI", "Django",
    "REST APIs", "GraphQL", "Git", "CI/CD", "Terraform", "Redis",
    "PostgreSQL", "MongoDB", "Machine Learning", "Data Analysis",
]

_SOFT_SKILLS = [
    "Leadership", "Communication", "Problem Solving", "Teamwork",
    "Project Management", "Agile/Scrum", "Mentoring", "Critical Thinking",
]

_MOCK_SUGGESTIONS: list[dict[str, str]] = [
    {"category": "content", "priority": "high", "text": "Add quantifiable achievements (e.g., 'Reduced API latency by 40%') to strengthen impact statements."},
    {"category": "content", "priority": "high", "text": "Include a professional summary at the top — 2-3 sentences highlighting your value proposition."},
    {"category": "keywords", "priority": "high", "text": "Add more industry-specific keywords to pass ATS filters. Mirror the language from job descriptions."},
    {"category": "formatting", "priority": "medium", "text": "Use consistent date formatting throughout (e.g., 'Jan 2022 – Present')."},
    {"category": "formatting", "priority": "medium", "text": "Ensure section headers are clearly distinct — use bold or larger font sizes."},
    {"category": "impact", "priority": "medium", "text": "Start bullet points with strong action verbs (Led, Architected, Optimized, Delivered)."},
    {"category": "content", "priority": "medium", "text": "Add links to GitHub, portfolio, or live projects to demonstrate hands-on ability."},
    {"category": "keywords", "priority": "low", "text": "Consider adding relevant certifications (AWS, GCP, PMP) to boost credibility."},
    {"category": "formatting", "priority": "low", "text": "Keep resume to 1-2 pages. Remove outdated roles (>10 years) unless highly relevant."},
    {"category": "impact", "priority": "high", "text": "Highlight cross-functional collaboration — hiring managers value engineers who work well across teams."},
]

_MOCK_STRENGTHS = [
    "Strong technical skill set with modern frameworks and cloud technologies",
    "Clear progression showing career growth and increasing responsibility",
    "Good mix of individual contribution and leadership experience",
    "Relevant education background aligned with target roles",
    "Experience with CI/CD and DevOps practices — highly valued in current market",
]


def _mock_skill_matches(parsed: ParsedResume, job_description: str) -> list[SkillMatch]:
    resume_text = parsed.raw_text.lower()
    matches: list[SkillMatch] = []

    for skill in _TECHNICAL_SKILLS:
        found = skill.lower() in resume_text
        # If no job description, show all found + a few not found
        if job_description:
            if skill.lower() in job_description.lower() or found:
                matches.append(SkillMatch(skill=skill, found=found, category="technical"))
        else:
            if found or random.random() < 0.3:
                matches.append(SkillMatch(skill=skill, found=found, category="technical"))

    for skill in _SOFT_SKILLS:
        found = skill.lower() in resume_text or random.random() < 0.5
        matches.append(SkillMatch(skill=skill, found=found, category="soft"))

    return matches


def _mock_analyze(parsed: ParsedResume, job_description: str, job_title: str) -> dict[str, Any]:
    skill_matches = _mock_skill_matches(parsed, job_description)
    found_count = sum(1 for m in skill_matches if m.found)
    total = len(skill_matches) or 1

    # Job match score based on skill overlap
    base_score = int((found_count / total) * 100)
    job_match_score = min(100, max(35, base_score + random.randint(-5, 10))) if job_description else None

    suggestions = [Suggestion(**s) for s in random.sample(_MOCK_SUGGESTIONS, k=min(6, len(_MOCK_SUGGESTIONS)))]
    strengths = random.sample(_MOCK_STRENGTHS, k=min(4, len(_MOCK_STRENGTHS)))

    return {
        "skill_matches": skill_matches,
        "suggestions": suggestions,
        "strengths": strengths,
        "job_match_score": job_match_score,
        "job_title_match": job_title or "Software Engineer",
    }


# ── Live OpenAI Analysis ───────────────────────────────────────

async def _live_analyze(parsed: ParsedResume, job_description: str, job_title: str) -> dict[str, Any]:
    """Call OpenAI for real analysis. Falls back to mock on error."""
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI()

        system_prompt = """You are an expert resume analyst and career coach. Analyze the resume and return a JSON object with:
- skill_matches: [{skill, found (bool), category}] — technical, soft, domain skills
- suggestions: [{category, priority, text}] — actionable improvements
- strengths: [string] — 3-5 key strengths
- job_match_score: int 0-100 (only if job description provided, else null)
- job_title_match: string — best matching job title

Be specific and actionable. Reference actual content from the resume."""

        user_prompt = f"Resume text:\n{parsed.raw_text[:4000]}\n\n"
        if job_description:
            user_prompt += f"Job description:\n{job_description[:2000]}\n\n"
        if job_title:
            user_prompt += f"Target job title: {job_title}\n\n"
        user_prompt += "Return valid JSON only."

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        data = json.loads(response.choices[0].message.content or "{}")

        return {
            "skill_matches": [SkillMatch(**s) for s in data.get("skill_matches", [])],
            "suggestions": [Suggestion(**s) for s in data.get("suggestions", [])],
            "strengths": data.get("strengths", []),
            "job_match_score": data.get("job_match_score"),
            "job_title_match": data.get("job_title_match", job_title or ""),
        }
    except Exception:
        # Fallback to mock on any error
        return _mock_analyze(parsed, job_description, job_title)


# ── Public API ──────────────────────────────────────────────────

async def analyze_resume(
    parsed: ParsedResume,
    job_description: str = "",
    job_title: str = "",
) -> dict[str, Any]:
    """Analyze a parsed resume. Uses OpenAI if API key is set, otherwise mock."""
    if _use_mock():
        return _mock_analyze(parsed, job_description, job_title)
    return await _live_analyze(parsed, job_description, job_title)
