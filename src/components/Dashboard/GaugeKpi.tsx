import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeKpiProps {
  percent: number; // 0-100
  color: string;
  size?: number;
}

export const GaugeKpi: React.FC<GaugeKpiProps> = ({ percent, color, size = 56 }) => {
  const clamped = Math.max(0, Math.min(100, isFinite(percent) ? percent : 0));
  const data = [
    { name: 'done', value: clamped },
    { name: 'rest', value: 100 - clamped },
  ];

  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="62%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GaugeKpi;
