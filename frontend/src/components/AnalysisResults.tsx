import { AnalysisResult } from '../services/api';
import ScoreCard from './ScoreCard';
import SkillsChart from './SkillsChart';
import {
  Shield, Type, Search, BookOpen,
  Lightbulb, AlertTriangle, CheckCircle2,
  ArrowUpCircle, ChevronRight, Target,
  Star, Briefcase, GraduationCap, Award
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const priorityColor: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
};

const priorityIcon: Record<string, React.ReactNode> = {
  high: <AlertTriangle className="w-4 h-4" />,
  medium: <ArrowUpCircle className="w-4 h-4" />,
  low: <Lightbulb className="w-4 h-4" />,
};

export default function AnalysisResults({ result, onReset }: Props) {
  const { parsed, ats_score, skill_matches, suggestions, strengths, job_match_score } = result;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {parsed.contact.name || 'Resume'} Analysis
          </h2>
          {parsed.contact.email && (
            <p className="text-sm text-gray-500 mt-1">{parsed.contact.email}</p>
          )}
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Analyze Another
        </button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <ScoreCard label="ATS Score" score={ats_score.overall} icon={<Shield className="w-4 h-4" />} />
        <ScoreCard label="Formatting" score={ats_score.formatting} icon={<Type className="w-4 h-4" />} />
        <ScoreCard label="Keywords" score={ats_score.keywords} icon={<Search className="w-4 h-4" />} />
        <ScoreCard label="Sections" score={ats_score.sections} icon={<BookOpen className="w-4 h-4" />} />
        <ScoreCard label="Readability" score={ats_score.readability} icon={<Star className="w-4 h-4" />} />
      </div>

      {/* Job Match */}
      {job_match_score !== null && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Job Match Score</h3>
              <p className="text-sm text-gray-500">
                {result.job_title_match || 'Target role'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-brand-600">{job_match_score}%</p>
              <p className="text-xs text-gray-400">match</p>
            </div>
          </div>
          <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-1000"
              style={{ width: `${job_match_score}%` }}
            />
          </div>
        </div>
      )}

      {/* Skills */}
      {skill_matches.length > 0 && <SkillsChart skills={skill_matches} />}

      {/* Strengths & Suggestions Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Suggestions
            </h3>
            <ul className="space-y-3">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 mt-0.5 ${priorityColor[s.priority] || priorityColor.medium}`}>
                    {priorityIcon[s.priority]}
                    {s.priority}
                  </span>
                  <span className="text-gray-700">{s.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ATS Details */}
      {ats_score.details.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">ATS Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {ats_score.details.map((d, i) => (
              <p key={i} className="text-sm text-gray-600 py-1">{d}</p>
            ))}
          </div>
        </div>
      )}

      {/* Parsed Sections Preview */}
      <div className="glass-card p-6 space-y-6">
        <h3 className="text-lg font-bold text-gray-900">Parsed Resume</h3>

        {parsed.experience.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-brand-500" /> Experience
            </h4>
            <div className="space-y-4">
              {parsed.experience.map((exp, i) => (
                <div key={i} className="pl-4 border-l-2 border-brand-200">
                  <p className="font-semibold text-gray-900">{exp.title}</p>
                  <p className="text-sm text-gray-500">{exp.company} {exp.dates && `· ${exp.dates}`}</p>
                  {exp.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.highlights.slice(0, 3).map((h, j) => (
                        <li key={j} className="text-sm text-gray-600 flex items-start gap-1.5">
                          <span className="text-brand-400 mt-1">•</span> {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {parsed.education.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-brand-500" /> Education
            </h4>
            {parsed.education.map((edu, i) => (
              <div key={i} className="pl-4 border-l-2 border-brand-200 mb-2">
                <p className="font-semibold text-gray-900">{edu.institution}</p>
                <p className="text-sm text-gray-500">{edu.degree} {edu.dates && `· ${edu.dates}`}</p>
              </div>
            ))}
          </div>
        )}

        {parsed.certifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-brand-500" /> Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {parsed.certifications.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
