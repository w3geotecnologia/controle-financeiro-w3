
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FinancialCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
  onClick?: () => void;
  monthText?: string;
  monthColor?: string;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  bgColor,
  onClick,
  monthText,
  monthColor
}) => {
  return (
    <div 
      className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl ${bgColor}`}>
          <Icon size={18} className="text-white sm:w-6 sm:h-6" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-600 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-lg sm:text-2xl font-bold text-slate-800">{value}</p>
      {monthText && (
        <p className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 ${monthColor || 'text-slate-600'}`}>
          {monthText}
        </p>
      )}
    </div>
  );
};
