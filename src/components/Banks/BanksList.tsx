import React from 'react';
import { BankCard } from './BankCard';
import { Bank } from '@/hooks/useBanksData';

interface BanksListProps {
  banks: Bank[];
  onEdit: (bank: Bank) => void;
  onDelete: (id: number) => void;
  onAddDeposit: (bank: Bank) => void;
}

export const BanksList: React.FC<BanksListProps> = ({
  banks,
  onEdit,
  onDelete,
  onAddDeposit
}) => {
  if (banks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 mb-4">Nenhum banco encontrado</div>
        <p className="text-gray-500">Comece adicionando sua primeira conta bancária.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {banks.map((bank) => (
        <BankCard
          key={bank.id}
          bank={bank}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddDeposit={onAddDeposit}
        />
      ))}
    </div>
  );
};