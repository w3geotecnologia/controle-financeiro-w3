
import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'

export interface BankOption {
  id: string
  name: string
  balance: number
}

export function useBanksOptions() {
  const [banks, setBanks] = useState<BankOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchBanks = async () => {
    try {
      setLoading(true)
      console.log('Iniciando busca de bancos...')
      const { data, error } = await supabase
        .from('banks')
        .select('id, name, balance')
        .order('name')
  
      console.log('Resposta da busca de bancos:', { data, error })
  
      if (error) throw error
  
      // Filtro para garantir apenas bancos com id válido
      const transformedData = (data || [])
        .filter(bank => !!bank.id && typeof bank.id === 'number')
        .map(bank => ({
          id: bank.id.toString(),
          name: bank.name,
          balance: bank.balance || 0
        }))
      
      setBanks(transformedData)
    } catch (err) {
      console.error('Erro ao carregar bancos:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar bancos')
    } finally {
      setLoading(false)
    }
  }

  return { 
    banks, 
    loading, 
    error, 
    refetch: fetchBanks,
    // Compatibilidade com hooks que esperam estas propriedades
    banksOptions: banks,
    isLoading: loading
  }
}
