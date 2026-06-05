import React from 'react';
import { Building2 } from 'lucide-react';

interface BankUIProps {
  bankName: string;
  accountNumber: string;
  agency: string;
  accountType: string;
  holderName?: string;
  balance: number;
  color?: string;
}

export const BankUI: React.FC<BankUIProps> = ({
  bankName,
  accountNumber,
  agency,
  accountType,
  holderName,
  balance,
  color = 'blue'
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBankGradient = (selectedColor: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-gradient-to-br from-blue-600 to-blue-800',
      'green': 'bg-gradient-to-br from-green-600 to-green-800',
      'purple': 'bg-gradient-to-br from-purple-600 to-purple-800',
      'orange': 'bg-gradient-to-br from-orange-600 to-red-600',
      'teal': 'bg-gradient-to-br from-teal-600 to-teal-800',
      'indigo': 'bg-gradient-to-br from-indigo-600 to-indigo-800',
      'pink': 'bg-gradient-to-br from-pink-600 to-pink-800',
      'cyan': 'bg-gradient-to-br from-cyan-600 to-cyan-800',
      'emerald': 'bg-gradient-to-br from-emerald-600 to-emerald-800',
      'violet': 'bg-gradient-to-br from-violet-600 to-violet-800',
      'black': 'bg-gradient-to-br from-gray-800 to-black',
      'silver': 'bg-gradient-to-br from-gray-400 to-gray-600',
      'gold': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    };
    
    return colorMap[selectedColor] || colorMap['blue'];
  };

  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      <div className={`
        ${getBankGradient(color)}
        rounded-lg p-3 text-white shadow-md
        aspect-[1.6/1] flex flex-col justify-between
        transform transition-transform hover:scale-102
        relative overflow-hidden
      `}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-white/20" />
          <div className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
        </div>

        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="text-[10px] font-medium opacity-90">
            {bankName.toUpperCase()}
          </div>
          <div className="bg-white/20 text-white border border-white/30 rounded-full px-1.5 py-0.5 text-[9px]">
            {accountType.toUpperCase()}
          </div>
        </div>

        {/* Bank Icon */}
        <div className="flex items-center space-x-2 relative z-10">
          <Building2 className="w-6 h-6 text-white" />
        </div>

        {/* Account Info */}
        <div className="relative z-10">
          <div className="font-mono text-xs tracking-wide mb-0.5">
            AG: {agency} • CC: {accountNumber}
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end relative z-10">
          <div className="flex-1 min-w-0">
            <div className="text-[9px] opacity-75 mb-0.5">TITULAR</div>
            <div className="font-medium text-[10px] truncate">
              {(holderName || bankName).toUpperCase()}
            </div>
          </div>
          <div className="text-right ml-1 flex-shrink-0">
            <div className="text-[9px] opacity-75 mb-0.5">SALDO</div>
            <div className="font-mono text-[12px]">{formatCurrency(balance)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
