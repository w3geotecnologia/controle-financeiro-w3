import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useBanksData } from '@/hooks/useBanksData';

export const BanksBalanceCard: React.FC = () => {
  const navigate = useNavigate();
  const { banks } = useBanksData();

  const list = [...(banks || [])].sort((a, b) => (b.balance || 0) - (a.balance || 0));
  const total = list.reduce((s, b) => s + (b.balance || 0), 0);

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Saldo por banco</h2>
        <button onClick={() => navigate('/bancos')} className="text-xs font-medium text-brand hover:underline">
          Ver todos
        </button>
      </div>

      <ul className="mt-3 divide-y divide-border flex-1">
        {list.length === 0 && <li className="py-3 text-sm text-muted-foreground">Nenhum banco cadastrado.</li>}
        {list.slice(0, 6).map((bank) => (
          <li key={bank.id} className="py-2.5 flex items-center gap-3">
            <span
              className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-brand-soft text-brand"
              style={bank.color ? { background: bank.color, color: '#fff' } : undefined}
            >
              <Landmark className="h-4 w-4" />
            </span>
            <span className="text-sm text-foreground flex-1 truncate">{bank.nickname || bank.name}</span>
            <span
              className={`text-sm font-medium tabular-nums ${
                (bank.balance || 0) < 0 ? 'text-danger' : 'text-foreground'
              }`}
            >
              {formatCurrency(bank.balance || 0)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className={`text-sm font-bold tabular-nums ${total < 0 ? 'text-danger' : 'text-foreground'}`}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};
