import React from 'react';
import { CreditCard } from 'lucide-react';
import { CardBrandIcon } from './CardBrandIcons';

interface CreditCardUIProps {
  bankName?: string;
  cardNumber: string;
  holderName?: string;
  expiry?: string;
  color?: string;
  brand?: string;
  cardName?: string;
}

export const CreditCardUI: React.FC<CreditCardUIProps> = ({
  bankName = "BANCO",
  cardNumber,
  holderName = "NOME DO TITULAR", 
  expiry = "00/00",
  color = "bg-gradient-to-r from-slate-600 to-slate-800",
  brand = "CREDIT",
  cardName
}) => {
  const formatCardNumber = (number: string) => {
    // Remove tudo que não é número
    const cleaned = number.replace(/\D/g, '');
    // Pega os últimos 4 dígitos
    const lastFour = cleaned.slice(-4) || '0000';
    // Sempre exibe no formato **** **** **** XXXX
    return `**** **** **** ${lastFour}`;
  };

  const formatExpiryDate = (expiry: string) => {
    if (!expiry) return "00/00";
    
    // Se vier no formato MM/AAAA, converte para MM/AA
    if (expiry.includes('/')) {
      const [month, year] = expiry.split('/');
      if (year && year.length === 4) {
        return `${month}/${year.slice(-2)}`;
      }
      return expiry;
    }
    
    // Se for apenas números, formata como MM/AA
    const numbers = expiry.replace(/\D/g, '');
    if (numbers.length >= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(-2)}`;
    }
    
    return expiry;
  };

  const getColorGradient = (colorValue?: string) => {
    if (!colorValue) return 'bg-gradient-to-br from-blue-600 to-blue-800';
    
    switch (colorValue) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'green':
        return 'bg-gradient-to-br from-green-600 to-green-800';
      case 'purple':
        return 'bg-gradient-to-br from-purple-600 to-purple-800';
      case 'orange':
        return 'bg-gradient-to-br from-orange-600 to-red-600';
      case 'teal':
        return 'bg-gradient-to-br from-teal-600 to-teal-800';
      case 'indigo':
        return 'bg-gradient-to-br from-indigo-600 to-indigo-800';
      case 'pink':
        return 'bg-gradient-to-br from-pink-600 to-pink-800';
      case 'cyan':
        return 'bg-gradient-to-br from-cyan-600 to-cyan-800';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-600 to-emerald-800';
      case 'violet':
        return 'bg-gradient-to-br from-violet-600 to-violet-800';
      case 'black':
        return 'bg-gradient-to-br from-gray-800 to-black';
      case 'silver':
        return 'bg-gradient-to-br from-gray-400 to-gray-600';
      case 'gold':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      default:
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
    }
  };

  const getBrandGradient = (cardBrand: string) => {
    // Se houver uma cor personalizada definida, usa ela
    if (color && color !== 'bg-gradient-to-r from-slate-600 to-slate-800') {
      return getColorGradient(color);
    }
    
    // Caso contrário, usa a cor padrão da bandeira
    switch (cardBrand?.toLowerCase()) {
      case 'visa':
        return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'mastercard':
        return 'bg-gradient-to-r from-red-500 to-orange-600';
      case 'elo':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'amex':
      case 'american express':
        return 'bg-gradient-to-r from-green-600 to-teal-700';
      default:
        return getColorGradient(color);
    }
  };

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Card Container */}
      <div className={`
        ${getBrandGradient(brand)}
        rounded-xl p-4 text-white shadow-lg
        aspect-[1.6/1] flex flex-col justify-between
        transform transition-transform hover:scale-105
        relative overflow-hidden text-xs
      `}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
        </div>

        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="text-xs font-medium opacity-90">
            {bankName.toUpperCase()}
          </div>
          <div className="text-right">
            {cardName && (
              <div className="text-xs font-semibold mb-1">{cardName.toUpperCase()}</div>
            )}
            <div className="text-xs opacity-75">{brand.toUpperCase()}</div>
          </div>
        </div>

        {/* Brand Icon */}
        <div className="flex items-center space-x-2 relative z-10">
          <CardBrandIcon brand={brand} className="w-8 h-6" />
        </div>

        {/* Card Number */}
        <div className="relative z-10">
          <div className="font-mono text-sm tracking-wider mb-1">
            {formatCardNumber(cardNumber)}
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end relative z-10">
          <div className="flex-1 min-w-0">
            <div className="text-xs opacity-75 mb-1">TITULAR</div>
            <div className="font-medium text-xs truncate">
              {(holderName || "NOME DO TITULAR").toUpperCase()}
            </div>
          </div>
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-xs opacity-75 mb-1">VÁLIDO ATÉ</div>
            <div className="font-mono text-xs">{formatExpiryDate(expiry)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};