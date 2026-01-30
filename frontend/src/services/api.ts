export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  dates: string;
  gpa: string;
}

export interface Experience {
  company: string;
  title: string;
  dates: string;
  highlights: string[];
}

export interface ParsedResume {
  raw_text: string;
  contact: ContactInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  certifications: string[];
}

export interface SkillMatch {
  skill: string;
  found: boolean;
  category: string;
}

export interface ATSScore {
  overall: number;
  formatting: number;
  keywords: number;
  sections: number;
  readability: number;
  details: string[];
}

export interface Suggestion {
  category: string;
  priority: string;
  text: string;
}

export interface AnalysisResult {
  parsed: ParsedResume;
  ats_score: ATSScore;
  skill_matches: SkillMatch[];
  suggestions: Suggestion[];
  strengths: string[];
  job_match_score: number | null;
  job_title_match: string;
}

const BASE = import.meta.env.VITE_API_URL || '';

export async function analyzeResume(
  file: File,
  jobDescription: string = '',
  jobTitle: string = '',
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append('file', file);
  if (jobDescription) form.append('job_description', jobDescription);
  if (jobTitle) form.append('job_title', jobTitle);

  const res = await fetch(`${BASE}/api/analyze`, { method: 'POST', body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
