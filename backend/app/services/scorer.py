"""ATS (Applicant Tracking System) compatibility scoring."""

from __future__ import annotations

import re

from app.models.schemas import ParsedResume, ATSScore


def _score_formatting(raw_text: str) -> tuple[int, list[str]]:
    """Score formatting quality (0-100)."""
    score = 100
    details: list[str] = []

    # Check for tables (ATS unfriendly)
    if "|" in raw_text and raw_text.count("|") > 10:
        score -= 15
        details.append("⚠️ Tables detected — many ATS systems cannot parse tables correctly")

    # Check length (too short or too long)
    word_count = len(raw_text.split())
    if word_count < 150:
        score -= 20
        details.append("⚠️ Resume appears too short — aim for 400-800 words")
    elif word_count > 1500:
        score -= 10
        details.append("⚠️ Resume may be too long — consider condensing to 1-2 pages")
    else:
        details.append("✅ Resume length is appropriate")

    # Check for special characters that confuse ATS
    special_chars = len(re.findall(r"[^\w\s@.,:;/\-()+&'\"#]", raw_text))
    if special_chars > 20:
        score -= 10
        details.append("⚠️ Excessive special characters may confuse ATS parsers")

    return max(0, score), details


def _score_keywords(parsed: ParsedResume) -> tuple[int, list[str]]:
    """Score keyword density and variety."""
    score = 50  # Start neutral
    details: list[str] = []

    skill_count = len(parsed.skills)
    if skill_count >= 10:
        score += 30
        details.append(f"✅ Good skill variety ({skill_count} skills listed)")
    elif skill_count >= 5:
        score += 15
        details.append(f"⚠️ Moderate skill count ({skill_count}) — aim for 10+")
    else:
        details.append(f"❌ Low skill count ({skill_count}) — add more relevant skills")

    # Action verbs
    action_verbs = ["led", "developed", "managed", "designed", "implemented",
                    "created", "built", "optimized", "delivered", "architected",
                    "improved", "reduced", "increased", "launched", "mentored"]
    text_lower = parsed.raw_text.lower()
    found_verbs = [v for v in action_verbs if v in text_lower]
    if len(found_verbs) >= 5:
        score += 20
        details.append(f"✅ Strong action verbs used ({len(found_verbs)} found)")
    elif len(found_verbs) >= 2:
        score += 10
        details.append(f"⚠️ Some action verbs found — use more power words")
    else:
        details.append("❌ Few action verbs — start bullets with Led, Built, Optimized, etc.")

    return min(100, max(0, score)), details


def _score_sections(parsed: ParsedResume) -> tuple[int, list[str]]:
    """Score section completeness."""
    score = 0
    details: list[str] = []

    if parsed.contact.name:
        score += 15
        details.append("✅ Name found")
    else:
        details.append("❌ Name not detected")

    if parsed.contact.email:
        score += 15
        details.append("✅ Email found")
    else:
        details.append("❌ Email not detected — essential for ATS")

    if parsed.experience:
        score += 25
        details.append(f"✅ Experience section ({len(parsed.experience)} entries)")
    else:
        score += 5
        details.append("❌ No experience section detected")

    if parsed.education:
        score += 20
        details.append(f"✅ Education section ({len(parsed.education)} entries)")
    else:
        score += 5
        details.append("⚠️ No education section detected")

    if parsed.skills:
        score += 15
        details.append("✅ Skills section found")
    else:
        details.append("❌ No skills section — critical for ATS keyword matching")

    if parsed.summary:
        score += 10
        details.append("✅ Summary/objective present")
    else:
        details.append("⚠️ No summary — consider adding a professional profile")

    return min(100, score), details


def _score_readability(raw_text: str) -> tuple[int, list[str]]:
    """Score readability and structure."""
    score = 70
    details: list[str] = []

    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    # Bullet points
    bullets = sum(1 for l in lines if l.startswith(("•", "-", "–", "▪", "*")))
    if bullets >= 5:
        score += 20
        details.append(f"✅ Good use of bullet points ({bullets} found)")
    elif bullets >= 2:
        score += 10
        details.append("⚠️ Consider using more bullet points for clarity")
    else:
        details.append("❌ No bullet points — use them for experience highlights")

    # Quantifiable achievements
    numbers = len(re.findall(r"\d+%|\$[\d,]+|\d+\+", raw_text))
    if numbers >= 3:
        score += 10
        details.append(f"✅ Quantifiable achievements found ({numbers} metrics)")
    else:
        details.append("⚠️ Add quantifiable results (%, $, numbers) to strengthen impact")

    return min(100, max(0, score)), details


def compute_ats_score(parsed: ParsedResume, raw_text: str) -> ATSScore:
    """Compute a comprehensive ATS compatibility score."""
    fmt_score, fmt_details = _score_formatting(raw_text)
    kw_score, kw_details = _score_keywords(parsed)
    sec_score, sec_details = _score_sections(parsed)
    read_score, read_details = _score_readability(raw_text)

    overall = int(fmt_score * 0.2 + kw_score * 0.3 + sec_score * 0.3 + read_score * 0.2)

    all_details = sec_details + kw_details + fmt_details + read_details

    return ATSScore(
        overall=overall,
        formatting=fmt_score,
        keywords=kw_score,
        sections=sec_score,
        readability=read_score,
        details=all_details,
    )
