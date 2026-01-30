"""PDF text extraction and resume section parsing."""

from __future__ import annotations

import re

import fitz  # PyMuPDF

from app.models.schemas import ParsedResume, ContactInfo, Education, Experience


def extract_text(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF byte string."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages: list[str] = []
    for page in doc:
        pages.append(page.get_text("text"))
    doc.close()
    return "\n".join(pages)


# ── Regex helpers ───────────────────────────────────────────────

_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE_RE = re.compile(r"[\+]?[\d\s\-().]{7,15}")
_LINKEDIN_RE = re.compile(r"linkedin\.com/in/[\w-]+", re.I)

_SECTION_HEADERS = re.compile(
    r"^(education|experience|work\s*experience|employment|skills|"
    r"technical\s*skills|certifications?|certificates?|projects?|"
    r"summary|objective|profile|about\s*me|awards?|publications?|"
    r"volunteer|languages?|interests?|hobbies?)\s*:?\s*$",
    re.I | re.M,
)


def _find_sections(text: str) -> dict[str, str]:
    """Split resume text into named sections."""
    matches = list(_SECTION_HEADERS.finditer(text))
    sections: dict[str, str] = {}
    for i, m in enumerate(matches):
        name = m.group(1).strip().lower()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[name] = text[start:end].strip()
    # Everything before the first header is the "header" section (name/contact)
    if matches:
        sections["_header"] = text[: matches[0].start()].strip()
    else:
        sections["_header"] = text[:500].strip()
    return sections


def _parse_contact(header: str) -> ContactInfo:
    lines = [l.strip() for l in header.split("\n") if l.strip()]
    name = lines[0] if lines else ""
    email_m = _EMAIL_RE.search(header)
    phone_m = _PHONE_RE.search(header)
    linkedin_m = _LINKEDIN_RE.search(header)
    return ContactInfo(
        name=name,
        email=email_m.group() if email_m else "",
        phone=phone_m.group().strip() if phone_m else "",
        linkedin=linkedin_m.group() if linkedin_m else "",
        location="",
    )


def _parse_education(text: str) -> list[Education]:
    """Simple heuristic education parser."""
    entries: list[Education] = []
    blocks = re.split(r"\n{2,}", text.strip())
    for block in blocks:
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue
        institution = lines[0]
        degree = lines[1] if len(lines) > 1 else ""
        dates = ""
        for line in lines:
            if re.search(r"\d{4}", line):
                dates = line
                break
        entries.append(Education(institution=institution, degree=degree, dates=dates))
    return entries


def _parse_experience(text: str) -> list[Experience]:
    """Simple heuristic experience parser."""
    entries: list[Experience] = []
    blocks = re.split(r"\n{2,}", text.strip())
    for block in blocks:
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue
        title_line = lines[0]
        company = lines[1] if len(lines) > 1 else ""
        dates = ""
        highlights: list[str] = []
        for line in lines[2:]:
            if re.search(r"\d{4}", line) and not dates:
                dates = line
            elif line.startswith(("•", "-", "–", "▪", "*")):
                highlights.append(line.lstrip("•-–▪* "))
            elif len(line) > 20:
                highlights.append(line)
        entries.append(Experience(company=company, title=title_line, dates=dates, highlights=highlights))
    return entries


def _parse_skills(text: str) -> list[str]:
    """Extract skill tokens from a skills section."""
    # Split on commas, pipes, bullets, newlines
    raw = re.split(r"[,|•\-–▪\n]+", text)
    skills = [s.strip() for s in raw if s.strip() and len(s.strip()) < 50]
    return skills


def parse_sections(raw_text: str) -> ParsedResume:
    """Parse raw resume text into structured sections."""
    sections = _find_sections(raw_text)

    contact = _parse_contact(sections.get("_header", ""))

    education: list[Education] = []
    for key in ("education",):
        if key in sections:
            education = _parse_education(sections[key])

    experience: list[Experience] = []
    for key in ("experience", "work experience", "employment"):
        if key in sections:
            experience = _parse_experience(sections[key])
            break

    skills: list[str] = []
    for key in ("skills", "technical skills"):
        if key in sections:
            skills = _parse_skills(sections[key])
            break

    summary = ""
    for key in ("summary", "objective", "profile", "about me"):
        if key in sections:
            summary = sections[key][:500]
            break

    certifications: list[str] = []
    for key in ("certifications", "certification", "certificates", "certificate"):
        if key in sections:
            certifications = [l.strip() for l in sections[key].split("\n") if l.strip()]
            break

    return ParsedResume(
        raw_text=raw_text,
        contact=contact,
        summary=summary,
        education=education,
        experience=experience,
        skills=skills,
        certifications=certifications,
    )
