import React from 'react';

export interface RankingItem {
  name: string;
  value: number;
  percentage?: number;
}

interface RankingBarsProps {
  items: RankingItem[];
  color: string; // bar color
  emptyLabel?: string;
  formatValue: (v: number) => string;
}

export const RankingBars: React.FC<RankingBarsProps> = ({ items, color, emptyLabel = 'Sem dados', formatValue }) => {
  if (!items.length) {
    return <div className="flex items-center justify-center h-[160px] text-xs text-slate-500">{emptyLabel}</div>;
  }

  const max = Math.max(...items.map((i) => i.value)) || 1;

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.name} className="grid grid-cols-[minmax(70px,38%)_1fr] items-center gap-2">
          <span className="text-[10px] leading-tight text-slate-600 text-right truncate" title={item.name}>
            {item.name}
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className="h-4 rounded-sm"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%`, backgroundColor: color }}
            />
            <span className="text-[10px] font-semibold text-slate-700 whitespace-nowrap">
              {formatValue(item.value)}
              {item.percentage !== undefined ? ` · ${item.percentage.toFixed(1)}%` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingBars;
