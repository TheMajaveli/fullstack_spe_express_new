import React from 'react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  helperText?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({ label, value, helperText, trend = 'neutral' }) => {
  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-sm space-y-3 transition-colors">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-600">{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black italic text-[var(--text-color)]">{value}</span>
        {helperText && (
          <span className={`text-xs font-black ${
            trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-500'
          }`}>
            {helperText}
          </span>
        )}
      </div>
    </div>
  );
};
