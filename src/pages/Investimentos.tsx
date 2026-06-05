import React, { useState } from 'react';
import { Plus, TrendingUp, AlertCircle, Search, Edit, Trash2, DollarSign, CheckCircle, Building2, Archive, FileText, Menu } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InvestmentForm } from '@/components/Dashboard/InvestmentForm';
import { ExpiredInvestmentCards } from '@/components/Dashboard/ExpiredInvestmentCards';
import { useInvestmentsData, Investment, InvestmentInstitution, InvestmentType } from '@/hooks/useInvestmentsData';
import { useToast } from '@/hooks/use-toast';
import { ExpiredInvestmentsTable } from '@/components/Dashboard/ExpiredInvestmentsTable';
import { InvestmentsSummaryCardsMobile } from '@/components/Dashboard/InvestmentsSummaryCardsMobile';
import { InvestmentsListMobile } from '@/components/Dashboard/InvestmentsListMobile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

const Investimentos = () => {
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const {
    investments,
    institutions,
    investmentTypes,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInstitution,
    addInvestmentType,
    moveExpiredInvestments,
    refetch
  } = useInvestmentsData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      // Cria a data como local para evitar problemas de timezone
      const date = new Date(dateString + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return '-';
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'renda_fixa': 'Renda Fixa',
      'renda_variavel': 'Renda Variável',
      'fundos': 'Fundos'
    };
    return categories[category] || category;
  };

  const getStatusLabel = (invested: number, current: number) => {
    return current >= invested ? 'Lucrativo' : 'Prejuízo';
  };

  const getStatusColor = (invested: number, current: number) => {
    return current >= invested ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const expiredInvestments = investments.filter(inv => {
    if (!inv.maturity_date) return false;
    
    try {
      // Cria a data como local para evitar problemas de timezone
      const date = new Date(inv.maturity_date + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return date <= new Date();
      }
    } catch (error) {
      console.error('Error checking expiry date:', error);
    }
    
    return false;
  });

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.investor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.institution?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'profitable' && Number(investment.current_value) >= Number(investment.invested_amount)) ||
                         (statusFilter === 'loss' && Number(investment.current_value) < Number(investment.invested_amount));
    
    const matchesCategory = categoryFilter === 'all' || investment.type?.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Cálculos baseados nos investimentos filtrados
  const totalInvestments = filteredInvestments.length;
  const profitableInvestments = filteredInvestments.filter(inv => 
    Number(inv.current_value) >= Number(inv.invested_amount)
  ).length;
  const totalInvested = filteredInvestments.reduce((sum, inv) => sum + Number(inv.invested_amount), 0);
  const totalCurrent = filteredInvestments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  // Soma dos rendimentos individuais (current_value - invested_amount) de cada investimento
  const totalRendimentos = filteredInvestments.reduce((sum, inv) => {
    const gain = Number(inv.current_value) - Number(inv.invested_amount);
    return sum + gain;
  }, 0);

  const handleCreateInvestment = async (investmentData: any) => {
    await addInvestment(investmentData);
    setShowInvestmentForm(false);
    toast({
      title: "Investimento criado com sucesso!",
      duration: 2000,
    });
  };

  const handleUpdateInvestment = async (investmentData: any) => {
    if (editingInvestment) {
      await updateInvestment({ ...investmentData, id: editingInvestment.id });
      setEditingInvestment(undefined);
      setShowInvestmentForm(false);
      toast({
        title: "Investimento atualizado com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleDeleteInvestment = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      await deleteInvestment(id);
      toast({
        title: "Investimento excluído com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowInvestmentForm(true);
  };

  const handleMoveExpiredInvestments = async () => {
    if (confirm('Tem certeza que deseja remover todas as aplicações vencidas? Esta ação não pode ser desfeita.')) {
      await moveExpiredInvestments();
    }
  };

  const closeInvestmentForm = () => {
    setShowInvestmentForm(false);
    setEditingInvestment(undefined);
  };

  const handleMoveExpiredInvestment = async (investmentId: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    if (confirm('Tem certeza que deseja arquivar esta aplicação vencida? Ela será movida para o histórico de investimentos vencidos.')) {
      try {
        // Buscar o investimento completo
        const investment = investments.find(inv => inv.id === investmentId);
        if (!investment) {
          toast({
            title: "Erro",
            description: "Investimento não encontrado.",
            variant: "destructive"
          });
          return;
        }

        // Inserir na tabela investimentos_vencidos
        const { error: insertError } = await supabase
          .from('investimentos_vencidos')
          .insert({
            name: investment.name,
            invested_amount: investment.invested_amount,
            current_value: investment.current_value,
            yield_percentage: investment.yield_percentage,
            purchase_date: investment.purchase_date,
            maturity_date: investment.maturity_date,
            investor_name: investment.investor_name,
            institution_id: investment.institution_id,
            type_id: investment.type_id,
            user_id: user.id
          });

        if (insertError) {
          console.error('Erro ao inserir investimento vencido:', insertError);
          toast({
            title: "Erro",
            description: "Não foi possível arquivar o investimento.",
            variant: "destructive"
          });
          return;
        }

        // Deletar da tabela investments
        const { error: deleteError } = await supabase
          .from('investments')
          .delete()
          .eq('id', investmentId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Erro ao deletar investimento:', deleteError);
          toast({
            title: "Erro",
            description: "Não foi possível remover o investimento da lista ativa.",
            variant: "destructive"
          });
          return;
        }

        // Atualizar a lista de investimentos
        await refetch();
        
        toast({
          title: "Sucesso",
          description: `${investment.name} foi arquivado com sucesso!`,
          duration: 2000,
        });
      } catch (error) {
        console.error('Erro ao arquivar investimento:', error);
        toast({
          title: "Erro",
          description: "Erro interno ao arquivar investimento.",
          variant: "destructive"
        });
      }
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Investimentos', 14, 20);
      
      // Data de geração
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
      
      // Resumo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo da Carteira', 14, 38);
      
      autoTable(doc, {
        startY: 42,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total Investido', formatCurrency(totalInvested)],
          ['Valor Atual', formatCurrency(totalCurrent)],
          ['Rentabilidade', `${gainPercentage.toFixed(2)}%`],
          ['Ganho/Perda', formatCurrency(totalGain)],
          ['Total de Investimentos', totalInvestments.toString()],
          ['Investimentos Lucrativos', profitableInvestments.toString()],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });
      
      // Detalhamento dos Investimentos
      const finalY = (doc as any).lastAutoTable.finalY || 42;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalhamento dos Investimentos', 14, finalY + 10);
      
      const tableData = filteredInvestments.map(investment => {
        const investedAmount = Number(investment.invested_amount);
        const currentValue = Number(investment.current_value);
        const gain = currentValue - investedAmount;
        const gainPerc = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;
        
        return [
          investment.name,
          investment.institution?.name || '-',
          investment.type?.name || '-',
          formatCurrency(investedAmount),
          formatCurrency(currentValue),
          `${gainPerc.toFixed(2)}%`,
          formatDate(investment.purchase_date),
          formatDate(investment.maturity_date || ''),
        ];
      });
      
      autoTable(doc, {
        startY: finalY + 14,
        head: [['Nome', 'Instituição', 'Tipo', 'Investido', 'Atual', 'Rendimento', 'Compra', 'Vencimento']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        columnStyles: {
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
        },
      });
      
      // Salvar PDF
      doc.save(`investimentos-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso!",
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive",
      });
    }
  };

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

            <div className="flex gap-3">
              <Button
                onClick={() => setShowInvestmentForm(true)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus size={18} className="mr-2" />
                Novo
              </Button>
              
              <Button
                onClick={handleExportPDF}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <FileText size={18} className="mr-2" />
                Exportar PDF
              </Button>
            </div>

            {expiredInvestments.length > 0 && (
              <Button 
                onClick={handleMoveExpiredInvestments}
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Archive size={18} className="mr-2" />
                Arquivar Vencidas ({expiredInvestments.length})
              </Button>
            )}
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

          {/* Filtros */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 text-xs h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="profitable">Lucrativos</SelectItem>
                <SelectItem value="loss">Prejuízo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="flex-1 text-xs h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
                <SelectItem value="renda_variavel">Renda Variável</SelectItem>
                <SelectItem value="fundos">Fundos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards de resumo */}
          <InvestmentsSummaryCardsMobile investments={filteredInvestments} />

          {/* Lista de investimentos */}
          <InvestmentsListMobile 
            investments={filteredInvestments}
            onEdit={handleEditInvestment}
          />

          {/* Modal de formulário */}
          {showInvestmentForm && (
            <InvestmentForm
              onSubmit={editingInvestment ? handleUpdateInvestment : handleCreateInvestment}
              onClose={closeInvestmentForm}
              institutions={institutions}
              investmentTypes={investmentTypes}
              onAddInstitution={addInstitution}
              onAddType={addInvestmentType}
              investment={editingInvestment}
            />
          )}
        </div>
      </Layout>
    );
  }

  // Desktop Layout
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="space-y-6">
          {/* Container interno só para o texto */}
          <div className="text-center py-10">
            <h1 className="text-3xl font-bold text-slate-800">Gestão de Investimentos</h1>
            <p className="text-slate-600 mt-1">
              Gerencie sua carteira de investimentos e acompanhe a performance
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowInvestmentForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Investimento
              </Button>
              
              <Button
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
            
            {expiredInvestments.length > 0 && (
              <Button 
                onClick={handleMoveExpiredInvestments}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Archive size={20} className="mr-2" />
                Arquivar Todas ({expiredInvestments.length})
              </Button>
            )}
          </div>

          <ExpiredInvestmentsTable 
            expiredInvestments={expiredInvestments}
            onMoveToExpired={handleMoveExpiredInvestment}
          />

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-600">Total Investido</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvested)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-600">Valor Atual</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalCurrent)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-600">Rendimentos</p>
              <p className={`text-2xl font-bold ${totalRendimentos >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(totalRendimentos)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-600">Rentabilidade</p>
              <p className={`text-2xl font-bold ${gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainPercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar investimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="profitable">Lucrativos</SelectItem>
                <SelectItem value="loss">Com Prejuízo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
                <SelectItem value="renda_variavel">Renda Variável</SelectItem>
                <SelectItem value="fundos">Fundos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabela de Investimentos */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="text-center py-2 px-2 font-semibold text-slate-800 border-r border-slate-300 w-12">#</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Investimento</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Instituição</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Tipo</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Investido</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Valor Atual</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Rendimento</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Status</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Compra</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800 border-r border-slate-300">Vencimento</th>
                    <th className="text-left py-2 px-4 font-semibold text-slate-800">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.map((investment, index) => {
                    const investedAmount = Number(investment.invested_amount);
                    const currentValue = Number(investment.current_value);
                    const gain = currentValue - investedAmount;
                    const gainPercentage = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;
                    
                    return (
                      <tr key={investment.id} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                        <td className="py-1 px-2 border-r border-slate-200 text-center">
                          <span className="font-medium text-slate-600">{index + 1}</span>
                        </td>
                        <td className="py-1 px-4 border-r border-slate-200">
                          <div>
                            <p className="font-medium text-slate-800">{investment.name}</p>
                            <p className="text-xs text-slate-500">{investment.investor_name || 'Sem investidor'}</p>
                          </div>
                        </td>
                        <td className="py-1 px-4 border-r border-slate-200">
                          <span className="font-medium text-slate-800">{investment.institution?.name}</span>
                        </td>
                        <td className="py-1 px-4 border-r border-slate-200">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {investment.type?.name}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            {getCategoryLabel(investment.type?.category || '')}
                          </p>
                        </td>
                        <td className="py-1 px-4 border-r border-slate-200">
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(investedAmount)}
                          </span>
                        </td>
                        <td className="py-1 px-4 border-r border-slate-200">
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(currentValue)}
                          </span>
                        </td>
                        <td className="py-1 px-4 border-r border-slate-200">
                          <div className="flex flex-col">
                            <span className={`font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(gain))}
                            </span>
                            <span className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {gainPercentage.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-1 px-4 border-r border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${gain >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`text-sm ${getStatusColor(investedAmount, currentValue)}`}>
                              {getStatusLabel(investedAmount, currentValue)}
                            </span>
                          </div>
                        </td>
                        <td className="py-1 px-4 text-sm text-slate-600 border-r border-slate-200">
                          {formatDate(investment.purchase_date)}
                        </td>
                        <td className="py-1 px-4 text-sm text-slate-600 border-r border-slate-200">
                          {formatDate(investment.maturity_date || '')}
                        </td>
                        <td className="py-1 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditInvestment(investment)}
                              className="text-slate-600 hover:text-slate-700 h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvestment(investment.id)}
                              className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
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
                <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-600 mb-2">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'Nenhum investimento encontrado' 
                    : 'Nenhum investimento cadastrado'}
                </p>
                <p className="text-slate-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Adicione seu primeiro investimento para começar.'}
                </p>
                {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                  <Button
                    onClick={() => setShowInvestmentForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Investimento
                  </Button>
                )}
              </div>
            )}
          </div>

          {showInvestmentForm && (
            <InvestmentForm
              onClose={closeInvestmentForm}
              onSubmit={editingInvestment ? handleUpdateInvestment : handleCreateInvestment}
              onAddInstitution={addInstitution}
              onAddType={addInvestmentType}
              investment={editingInvestment}
              institutions={institutions}
              investmentTypes={investmentTypes}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Investimentos;
