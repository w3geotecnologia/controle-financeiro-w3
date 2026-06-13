import type { BankOption } from '@/hooks/useBanksOptions';

type AccountBankFields = {
  bank_id?: number | string | null;
  payment_source_id?: number | string | null;
  payment_source_name?: string | null;
  bank_name?: string | null;
};

const normalizeBankName = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export const accountMatchesBankFilter = (
  account: AccountBankFields,
  bankFilter: string,
  banks: BankOption[] = []
) => {
  if (bankFilter === 'todos') return true;

  const filterValue = String(bankFilter);
  const accountBankId = account.bank_id == null ? '' : String(account.bank_id);
  const accountPaymentSourceId = account.payment_source_id == null ? '' : String(account.payment_source_id);

  if (accountBankId === filterValue || accountPaymentSourceId === filterValue) {
    return true;
  }

  const normalizedFilter = normalizeBankName(filterValue);
  const selectedBank = banks.find(bank =>
    String(bank.id) === filterValue || normalizeBankName(bank.name) === normalizedFilter
  );
  const selectedBankName = normalizeBankName(selectedBank?.name || filterValue);
  const accountBankNames = [account.payment_source_name, account.bank_name]
    .map(normalizeBankName)
    .filter(Boolean);

  return accountBankNames.includes(selectedBankName);
};