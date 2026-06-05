import React, { useState } from 'react';
import { Edit, Trash2, Archive, TrendingUp, Calendar, Search, Menu } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useExpiredInvestments } from '@/hooks/useExpiredInvestments';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { ExpiredInvestmentsSummaryCardsMobile } from '@/components/Dashboard/ExpiredInvestmentsSummaryCardsMobile';
import { ExpiredInvestmentsListMobile } from '@/components/Dashboard/ExpiredInvestmentsListMobile';

const InvestimentosVencidos = () => {
  const { toast } = useToast();
  const { expiredInvestments, loading, deleteExpiredInvestment } = useExpiredInvestments();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleEdit = (investment: any) => {
    console.log('Editando investimento:', investment);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de investimentos vencidos será implementada em breve.",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este investimento vencido permanentemente?')) {
      deleteExpiredInvestment(id);
    }
  };

  // Filtrar investimentos com base no termo de pesquisa
  const filteredInvestments = expiredInvestments.filter(investment =>
    investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (investment.investor_name && investment.investor_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular valores baseados nos investimentos filtrados
  const totalFilteredValue = filteredInvestments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const lastMaturityDate = filteredInvestments.length > 0 
    ? filteredInvestments.sort((a, b) => new Date(b.maturity_date || '').getTime() - new Date(a.maturity_date || '').getTime())[0]?.maturity_date
    : null;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando investimentos vencidos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <Layout>
        <div className="space-y-4 p-4">
          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Menu className="h-5 w-5" />
              Menu Principal
            </Button>

            <Button
              onClick={() => navigate('/investimentos')}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <TrendingUp size={18} className="mr-2" />
              Investimentos Ativos
            </Button>
          </div>

          {/* Campo de pesquisa */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Pesquisar investimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cards de resumo */}
          <ExpiredInvestmentsSummaryCardsMobile investments={filteredInvestments} />

          {/* Lista de investimentos */}
          <ExpiredInvestmentsListMobile 
            investments={filteredInvestments}
            onDelete={handleDelete}
          />
        </div>
      </Layout>
    );
  }

  // Desktop Layout
  return (
    <Layout>
      <div className="space-y-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Investimentos Vencidos</h1>
              <p className="text-slate-600 mt-1">
                Histórico de aplicações que já venceram
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Archive className="h-6 w-6 text-orange-500" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {filteredInvestments.length} Vencidos
              </Badge>
            </div>
          </div>
        </div>

        {/* Campo de Pesquisa */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome do investimento ou investidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Investimentos</p>
                <p className="text-2xl font-bold text-slate-800">{filteredInvestments.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Archive className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Total Resgatado</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(totalFilteredValue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Último Vencimento</p>
                <p className="text-2xl font-bold text-slate-800">
                  {lastMaturityDate ? formatDate(lastMaturityDate) : '-'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Investimentos Vencidos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Histórico de Investimentos Vencidos</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-2 font-semibold text-slate-700">Investimento</th>
                  <th className="text-left p-2 font-semibold text-slate-700">Investido</th>
                  <th className="text-left p-2 font-semibold text-slate-700">Valor Final</th>
                  <th className="text-left p-2 font-semibold text-slate-700">Rendimento</th>
                  <th className="text-left p-2 font-semibold text-slate-700">Compra</th>
                  <th className="text-left p-2 font-semibold text-slate-700">Vencimento</th>
                  <th className="text-left p-2 font-semibold text-slate-700">Movido</th>
                  <th className="text-left p-2 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestments.map((investment, index) => {
                  const investedAmount = Number(investment.invested_amount);
                  const currentValue = Number(investment.current_value);
                  const gain = currentValue - investedAmount;
                  const gainPercentage = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;
                  
                  return (
                    <tr key={investment.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="py-1 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Archive className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{investment.name}</p>
                            <p className="text-sm text-slate-500">{investment.investor_name || 'Sem investidor'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-1 px-2">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(investedAmount)}
                        </span>
                      </td>
                      <td className="py-1 px-2">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(currentValue)}
                        </span>
                      </td>
                      <td className="py-1 px-2">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                          </span>
                          <span className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-1 px-2 text-sm text-slate-600">
                        {formatDate(investment.purchase_date)}
                      </td>
                      <td className="py-1 px-2 text-sm text-slate-600">
                        {formatDate(investment.maturity_date)}
                      </td>
                      <td className="py-1 px-2 text-sm text-slate-600">
                        {formatDate(investment.moved_at)}
                      </td>
                      <td className="py-1 px-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(investment)}
                            className="text-slate-600 hover:text-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(investment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredInvestments.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Archive className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 mb-2">
                {searchTerm ? 'Nenhum investimento encontrado para a pesquisa' : 'Nenhum investimento vencido encontrado'}
              </p>
              <p className="text-slate-500">
                {searchTerm ? 'Tente pesquisar com outros termos.' : 'Os investimentos aparecerão aqui quando forem movidos após o vencimento.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InvestimentosVencidos;
