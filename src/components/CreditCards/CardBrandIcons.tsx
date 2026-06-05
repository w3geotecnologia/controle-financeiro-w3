import React from 'react';
import { CreditCard } from 'lucide-react';

interface CardBrandIconProps {
  brand: string;
  className?: string;
}

export const CardBrandIcon: React.FC<CardBrandIconProps> = ({ brand, className = "w-8 h-6" }) => {
  const getBrandIcon = () => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return (
          <div className={`${className} bg-white rounded flex items-center justify-center font-bold text-blue-800 text-xs border`}>
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className={`${className} flex items-center justify-center rounded overflow-hidden`}>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full -mr-1 z-10" />
              <div className="w-3 h-3 bg-orange-400 rounded-full" />
            </div>
          </div>
        );
      case 'elo':
        return (
          <div className={`${className} bg-yellow-500 rounded flex items-center justify-center font-bold text-black text-xs`}>
            ELO
          </div>
        );
      case 'amex':
      case 'american express':
        return (
          <div className={`${className} bg-blue-700 rounded flex items-center justify-center font-bold text-white text-xs`}>
            AMEX
          </div>
        );
      default:
        // Chip genérico dourado como fallback
        return (
          <div className={`${className} rounded bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center border border-yellow-300`}>
            <div className="w-4 h-3 rounded-sm bg-yellow-600 opacity-80" />
          </div>
        );
    }
  };

  return getBrandIcon();
};