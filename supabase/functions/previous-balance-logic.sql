
-- Função para buscar saldo do mês anterior
CREATE OR REPLACE FUNCTION get_previous_month_balance(
  target_user_id UUID,
  target_year INTEGER,
  target_month INTEGER
)
RETURNS TABLE(valor NUMERIC, automatico BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT s.valor, s.automatico
  FROM saldo_mes_anterior s
  WHERE s.user_id = target_user_id
    AND s.ano = target_year
    AND s.mes = target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para salvar saldo do mês anterior
CREATE OR REPLACE FUNCTION save_previous_month_balance(
  target_user_id UUID,
  target_year INTEGER,
  target_month INTEGER,
  balance_value NUMERIC,
  is_automatic BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO saldo_mes_anterior (user_id, ano, mes, valor, automatico, updated_at)
  VALUES (target_user_id, target_year, target_month, balance_value, is_automatic, NOW())
  ON CONFLICT (user_id, ano, mes)
  DO UPDATE SET
    valor = balance_value,
    automatico = is_automatic,
    updated_at = NOW();
    
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar saldo do último dia do ano anterior
CREATE OR REPLACE FUNCTION get_previous_year_final_balance(
  target_user_id UUID,
  target_year INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
  last_day_previous_year DATE;
  final_balance NUMERIC := 0;
  total_receitas NUMERIC := 0;
  total_despesas NUMERIC := 0;
  saldo_anterior NUMERIC := 0;
BEGIN
  last_day_previous_year := (target_year - 1 || '-12-31')::DATE;
  
  -- Buscar saldo anterior de dezembro do ano anterior
  SELECT COALESCE(valor, 0) INTO saldo_anterior
  FROM saldo_mes_anterior
  WHERE user_id = target_user_id
    AND ano = target_year - 1
    AND mes = 12;
  
  -- Calcular total de receitas recebidas em dezembro do ano anterior
  SELECT COALESCE(SUM(amount), 0) INTO total_receitas
  FROM accounts
  WHERE user_id = target_user_id
    AND type = 'receita'
    AND status = 'recebido'
    AND EXTRACT(YEAR FROM due_date::DATE) = target_year - 1
    AND EXTRACT(MONTH FROM due_date::DATE) = 12;
  
  -- Calcular total de despesas pagas em dezembro do ano anterior
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO total_despesas
  FROM accounts
  WHERE user_id = target_user_id
    AND type = 'despesa'
    AND status = 'pago'
    AND EXTRACT(YEAR FROM due_date::DATE) = target_year - 1
    AND EXTRACT(MONTH FROM due_date::DATE) = 12;
  
  final_balance := saldo_anterior + total_receitas - total_despesas;
  
  RETURN final_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
