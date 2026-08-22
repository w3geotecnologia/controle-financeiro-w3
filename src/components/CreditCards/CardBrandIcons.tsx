import React from 'react';

interface CardBrandIconProps {
  brand: string;
  className?: string;
}

export const CardBrandIcon: React.FC<CardBrandIconProps> = ({ brand, className = "w-8 h-6" }) => {
  const getBrandIcon = () => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return (
          <div aria-label="Visa" className={`${className} rounded border border-border bg-card flex items-center justify-center overflow-hidden`}>
            <img src="/src/assets/visa-logo.jpg" alt="Visa" className="h-full w-full object-contain" />
          </div>
        );
      case 'mastercard':
        return (
          <div aria-label="Mastercard" className={`${className} rounded border border-border bg-card flex items-center justify-center overflow-hidden`}>
            <img src="/src/assets/mastercard-logo.jpg" alt="Mastercard" className="h-full w-full object-contain" />
          </div>
        );
      case 'elo':
        return (
          <div aria-label="Elo" className={`${className} bg-warning rounded flex items-center justify-center font-extrabold text-warning-foreground text-[10px]`}>
            ELO
          </div>
        );
      case 'amex':
      case 'american express':
        return (
          <div aria-label="American Express" className={`${className} bg-brand rounded flex items-center justify-center font-extrabold text-brand-foreground text-[9px]`}>
            AMEX
          </div>
        );
      default:
        return (
          <div aria-label="Cartão" className={`${className} rounded bg-warning-soft flex items-center justify-center border border-warning/40`}>
            <div className="w-4 h-3 rounded-sm bg-warning opacity-80" />
          </div>
        );
    }
  };

  return getBrandIcon();
};