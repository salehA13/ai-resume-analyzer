import { SkillMatch } from '../services/api';
import { Check, X } from 'lucide-react';

interface Props {
  skills: SkillMatch[];
}

export default function SkillsChart({ skills }: Props) {
  const technical = skills.filter(s => s.category === 'technical');
  const soft = skills.filter(s => s.category === 'soft');
  const other = skills.filter(s => s.category !== 'technical' && s.category !== 'soft');

  const foundCount = skills.filter(s => s.found).length;
  const matchPercent = skills.length ? Math.round((foundCount / skills.length) * 100) : 0;

  const renderGroup = (title: string, items: SkillMatch[]) => {
    if (!items.length) return null;
    return (
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((s) => (
            <span
              key={s.skill}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${s.found
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
                }
              `}
            >
              {s.found ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {s.skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Skills Analysis</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${matchPercent}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600">
            {foundCount}/{skills.length} matched
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {renderGroup('Technical Skills', technical)}
        {renderGroup('Soft Skills', soft)}
        {renderGroup('Other', other)}
      </div>
    </div>
  );
}
