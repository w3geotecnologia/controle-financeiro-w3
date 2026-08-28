import React from 'react';
import {
  Building2, Landmark, PiggyBank, Wallet, CreditCard, DollarSign,
  Coins, Banknote, TrendingUp, Vault, HandCoins, CircleDollarSign
} from 'lucide-react';

export const BANK_ICON_OPTIONS = [
  { value: 'icon:landmark', label: 'Banco', Icon: Landmark },
  { value: 'icon:building', label: 'Prédio', Icon: Building2 },
  { value: 'icon:piggy', label: 'Poupança', Icon: PiggyBank },
  { value: 'icon:wallet', label: 'Carteira', Icon: Wallet },
  { value: 'icon:creditcard', label: 'Cartão', Icon: CreditCard },
  { value: 'icon:dollar', label: 'Dólar', Icon: DollarSign },
  { value: 'icon:coins', label: 'Moedas', Icon: Coins },
  { value: 'icon:banknote', label: 'Dinheiro', Icon: Banknote },
  { value: 'icon:trending', label: 'Investimento', Icon: TrendingUp },
  { value: 'icon:vault', label: 'Cofre', Icon: Vault },
  { value: 'icon:handcoins', label: 'Empréstimo', Icon: HandCoins },
  { value: 'icon:circle-dollar', label: 'Finanças', Icon: CircleDollarSign },
];

interface BankLogoProps {
  logoUrl?: string | null;
  className?: string;
  iconClassName?: string;
}

/**
 * Renders the bank logo: an uploaded image (data URL), a preset icon
 * (stored as "icon:<name>"), or a default building icon.
 */
export const BankLogo: React.FC<BankLogoProps> = ({
  logoUrl,
  className = 'w-10 h-10',
  iconClassName = 'w-5 h-5 text-muted-foreground',
}) => {
  if (logoUrl && logoUrl.startsWith('icon:')) {
    const option = BANK_ICON_OPTIONS.find(o => o.value === logoUrl);
    const Icon = option?.Icon || Building2;
    return (
      <div className={`${className} rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0`}>
        <Icon className={iconClassName} />
      </div>
    );
  }

  if (logoUrl) {
    return (
      <div className={`${className} rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0`}>
        <img src={logoUrl} alt="Ícone do banco" className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0`}>
      <Building2 className={iconClassName} />
    </div>
  );
};
