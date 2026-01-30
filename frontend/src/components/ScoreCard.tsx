import { useEffect, useState } from 'react';

interface Props {
  label: string;
  score: number;
  size?: number;
  color?: string;
  icon?: React.ReactNode;
}

function getColor(score: number): string {
  if (score >= 80) return '#10b981'; // emerald
  if (score >= 60) return '#338bff'; // brand blue
  if (score >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function getGrade(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

export default function ScoreCard({ label, score, size = 120, icon }: Props) {
  const [animated, setAnimated] = useState(0);
  const color = getColor(score);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{animated}</span>
          <span className="text-xs text-gray-400 font-medium">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
          {icon}
          {label}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color }}>
          {getGrade(score)}
        </p>
      </div>
    </div>
  );
}
