
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ExpiringAccountsAlert } from '@/components/Reports/ExpiringAccountsAlert';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';
import { ReportsListMobile } from '@/components/Reports/ReportsListMobile';
import { ReportsSummaryCardsMobile } from '@/components/Reports/ReportsSummaryCardsMobile';
import { TrendingUp, TrendingDown, Calendar, Download, Filter, Search, ArrowLeft, Wallet, DollarSign, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

import { useAccounts } from '@/contexts/AccountsContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Relatorios: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { accounts, getTotalReceitas, getTotalDespesas, getSaldo } = useAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [isAnnualView, setIsAnnualView] = useState(false);
  
  // Inicializar com mês atual
  const today = new Date();
  const [monthFilter, setMonthFilter] = useState((today.getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(today.getFullYear().toString());

  const { toast } = useToast();

  // Para o MonthNavigator (que usa 0-11 para meses)
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10) - 1;
  const currentYear = parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos';

  // Funções para o MonthNavigator
  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setMonthFilter((month + 1).toString()); // MonthNavigator usa 0-11, nossos filtros usam 1-12
    setYearFilter(year.toString());
  };

  const handleShowAll = () => {
    setMonthFilter('todos');
    setYearFilter('todos');
    setIsAnnualView(false);
  };

  const handleAnnualView = () => {
    setIsAnnualView(!isAnnualView);
    if (!isAnnualView) {
      setMonthFilter('todos');
    }
  };

  // Calcular saldo acumulado até um determinado mês/ano
  const calculateAccumulatedBalance = useCallback((untilMonth: number, untilYear: number) => {
    if (!accounts || accounts.length === 0) return 0;
    
    let totalRecebido = 0;
    let totalPago = 0;
    
    for (const acc of accounts) {
      if (!acc.dueDate || acc.description === "Saldo Anterior") continue;
      
      const d = new Date(acc.dueDate + "T00:00:00");
      const accYear = d.getFullYear();
      const accMonth = d.getMonth();
      
      // Verificar se está dentro do período
      if (accYear < untilYear || (accYear === untilYear && accMonth <= untilMonth)) {
        if (acc.type === "receita" && acc.status === "recebido") {
          totalRecebido += acc.amount;
        } else if (acc.type === "despesa" && acc.status === "pago") {
          totalPago += Math.abs(acc.amount);
        }
      }
    }
    
    return totalRecebido - totalPago;
  }, [accounts]);

  // Calcular previousBalance dinamicamente baseado no saldo final do mês anterior
  const previousBalance = useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    const targetMonth = isShowingAll ? 0 : currentMonth;
    const targetYear = currentYear;
    
    // Para janeiro, calcular baseado em dezembro do ano anterior
    if (targetMonth === 0) {
      return calculateAccumulatedBalance(11, targetYear - 1);
    }
    
    // Para outros meses, calcular baseado no mês anterior do mesmo ano
    return calculateAccumulatedBalance(targetMonth - 1, targetYear);
  }, [accounts, currentMonth, currentYear, isShowingAll, calculateAccumulatedBalance]);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Cabeçalho - texto em negrito sem fundo azul
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text('Relatório Financeiro', pageWidth / 2, 14, { align: 'center' });
      
      // Período e data
      const periodo = monthFilter === 'todos' 
        ? 'Todos os períodos' 
        : `${String(monthFilter).padStart(2, '0')}/${yearFilter}`;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Período: ${periodo}`, pageWidth / 2, 22, { align: 'center' });
      
      const dataGeracao = new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', month: 'long', year: 'numeric' 
      });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Gerado em: ${dataGeracao}`, pageWidth / 2, 28, { align: 'center' });
      
      // Subtítulo "Resumo do Período"
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text('Resumo do Período', 14, 36);
      
      // Resumo Financeiro - Tabela com grid e cabeçalho azul
      autoTable(doc, {
        startY: 40,
        head: [['Descrição', 'Valor']],
        body: [
          ['Saldo Anterior', formatCurrencyPDF(previousBalance)],
          ['Total de Receitas', formatCurrencyPDF(filteredReceitas)],
          ['Total de Despesas', `-${formatCurrencyPDF(filteredDespesas)}`],
          ['Saldo Final', formatCurrencyPDF(filteredSaldoFinal)]
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [59, 130, 246], // blue-500
          fontSize: 9, 
          fontStyle: 'bold',
          textColor: [255, 255, 255], // white
          halign: 'left'
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 4,
          lineColor: [203, 213, 225], // slate-300
          lineWidth: 0.3
        },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold', textColor: [71, 85, 105] },
          1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        },
        bodyStyles: { fillColor: [255, 255, 255] },
        didParseCell: function(data) {
          if (data.column.index === 1 && data.section === 'body') {
            const rowIndex = data.row.index;
            if (rowIndex === 1) data.cell.styles.textColor = [59, 130, 246]; // blue - receitas
            else if (rowIndex === 2) data.cell.styles.textColor = [220, 38, 38]; // red - despesas
            else data.cell.styles.textColor = [51, 65, 85]; // slate-700
          }
        }
      });
      
      let currentY = (doc as any).lastAutoTable.finalY + 10;
      
      // Subtítulo "Detalhamento das Contas"
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text('Detalhamento das Contas', 14, currentY);
      currentY += 8;
      
      // Agrupar contas por categoria
      const groupByCategory = (accs: typeof filteredAccounts, type: 'receita' | 'despesa') => {
        const filtered = accs.filter(a => a.type === type);
        const groups: Record<string, { accounts: typeof filtered; total: number }> = {};
        
        filtered.forEach(acc => {
          const cat = acc.category || 'Sem Categoria';
          if (!groups[cat]) {
            groups[cat] = { accounts: [], total: 0 };
          }
          groups[cat].accounts.push(acc);
          groups[cat].total += Math.abs(acc.amount);
        });
        
        // Ordenar contas por data de vencimento crescente dentro de cada grupo
        Object.values(groups).forEach(group => {
          group.accounts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        });
        
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
      };
      
      const receitasGroups = groupByCategory(filteredAccounts, 'receita');
      const despesasGroups = groupByCategory(filteredAccounts, 'despesa');
      
      // SEÇÃO RECEITAS
      if (receitasGroups.length > 0) {
        // Título da seção em azul
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246); // blue
        doc.text('RECEITAS', 14, currentY);
        currentY += 5;
        
        let totalGeralReceitas = 0;
        
        receitasGroups.forEach(([category, data]) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          
          // Category header
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(71, 85, 105); // slate-600
          doc.text(category, 14, currentY + 4);
          currentY += 6;
          
          const categoryData = data.accounts.map((acc, idx) => [
            String(idx + 1),
            acc.description,
            formatDate(acc.dueDate),
            getStatusLabel(acc.status),
            formatCurrencyPDF(acc.amount)
          ]);
          
          autoTable(doc, {
            startY: currentY,
            head: [['#', 'Descrição', 'Data', 'Status', 'Valor']],
            body: categoryData,
            theme: 'grid',
            headStyles: { 
              fillColor: [241, 245, 249], // slate-100
              fontSize: 8, 
              fontStyle: 'bold',
              textColor: [71, 85, 105] // slate-600
            },
            styles: { 
              fontSize: 8, 
              cellPadding: 3, 
              textColor: [71, 85, 105],
              lineColor: [203, 213, 225], // slate-300
              lineWidth: 0.2
            },
            columnStyles: {
              0: { cellWidth: 12, halign: 'center' },
              1: { cellWidth: 70 },
              2: { cellWidth: 25, halign: 'center' },
              3: { cellWidth: 25, halign: 'center' },
              4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
            },
            bodyStyles: { fillColor: [255, 255, 255] },
            margin: { left: 14, right: 14 },
            didParseCell: function(data) {
              // Colorir valor em azul
              if (data.column.index === 4 && data.section === 'body') {
                data.cell.styles.textColor = [59, 130, 246]; // blue
              }
              // Colorir status
              if (data.column.index === 3 && data.section === 'body') {
                const status = data.cell.raw as string;
                if (status === 'Recebido') data.cell.styles.textColor = [59, 130, 246]; // blue
                else if (status === 'Pendente') data.cell.styles.textColor = [234, 179, 8];
              }
            }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 2;
          
          // Category subtotal em tabela - preto negrito
          autoTable(doc, {
            startY: currentY,
            body: [[`Subtotal ${category}`, formatCurrencyPDF(data.total)]],
            theme: 'grid',
            styles: { 
              fontSize: 8, 
              cellPadding: 2,
              lineColor: [203, 213, 225],
              lineWidth: 0.2
            },
            columnStyles: {
              0: { cellWidth: 132, fontStyle: 'bold', textColor: [31, 41, 55] }, // gray-800 (preto)
              1: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [31, 41, 55] } // preto
            },
            bodyStyles: { fillColor: [248, 250, 252] }, // slate-50
            margin: { left: 14, right: 14 }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 4;
          totalGeralReceitas += data.total;
        });
        
        // Total receitas em tabela - azul
        autoTable(doc, {
          startY: currentY,
          body: [['TOTAL RECEITAS', formatCurrencyPDF(totalGeralReceitas)]],
          theme: 'grid',
          styles: { 
            fontSize: 10, 
            cellPadding: 4,
            lineColor: [203, 213, 225],
            lineWidth: 0.3
          },
          columnStyles: {
            0: { cellWidth: 132, fontStyle: 'bold', textColor: [59, 130, 246] }, // blue
            1: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] } // blue
          },
          bodyStyles: { fillColor: [239, 246, 255] }, // blue-50
          margin: { left: 14, right: 14 }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // SEÇÃO DESPESAS
      if (despesasGroups.length > 0) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 20;
        }
        
        // Título da seção
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38); // red
        doc.text('DESPESAS', 14, currentY);
        currentY += 5;
        
        let totalGeralDespesas = 0;
        
        despesasGroups.forEach(([category, data]) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          
          // Category header
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(71, 85, 105);
          doc.text(category, 14, currentY + 4);
          currentY += 6;
          
          // Valores com sinal negativo
          const categoryData = data.accounts.map((acc, idx) => [
            String(idx + 1),
            acc.description,
            formatDate(acc.dueDate),
            getStatusLabel(acc.status),
            `-${formatCurrencyPDF(Math.abs(acc.amount))}`
          ]);
          
          autoTable(doc, {
            startY: currentY,
            head: [['#', 'Descrição', 'Data', 'Status', 'Valor']],
            body: categoryData,
            theme: 'grid',
            headStyles: { 
              fillColor: [241, 245, 249], // slate-100
              fontSize: 8, 
              fontStyle: 'bold',
              textColor: [71, 85, 105]
            },
            styles: { 
              fontSize: 8, 
              cellPadding: 3, 
              textColor: [71, 85, 105],
              lineColor: [203, 213, 225],
              lineWidth: 0.2
            },
            columnStyles: {
              0: { cellWidth: 12, halign: 'center' },
              1: { cellWidth: 70 },
              2: { cellWidth: 25, halign: 'center' },
              3: { cellWidth: 25, halign: 'center' },
              4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
            },
            bodyStyles: { fillColor: [255, 255, 255] },
            margin: { left: 14, right: 14 },
            didParseCell: function(data) {
              // Colorir valor em vermelho
              if (data.column.index === 4 && data.section === 'body') {
                data.cell.styles.textColor = [220, 38, 38]; // red
              }
              // Colorir status
              if (data.column.index === 3 && data.section === 'body') {
                const status = data.cell.raw as string;
                if (status === 'Pago') data.cell.styles.textColor = [220, 38, 38];
                else if (status === 'Pendente') data.cell.styles.textColor = [234, 179, 8];
              }
            }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 2;
          
          // Category subtotal em tabela - preto negrito com sinal negativo
          autoTable(doc, {
            startY: currentY,
            body: [[`Subtotal ${category}`, `-${formatCurrencyPDF(data.total)}`]],
            theme: 'grid',
            styles: { 
              fontSize: 8, 
              cellPadding: 2,
              lineColor: [203, 213, 225],
              lineWidth: 0.2
            },
            columnStyles: {
              0: { cellWidth: 132, fontStyle: 'bold', textColor: [31, 41, 55] }, // preto
              1: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [31, 41, 55] } // preto
            },
            bodyStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 4;
          totalGeralDespesas += data.total;
        });
        
        // Total despesas em tabela - vermelho com sinal negativo
        autoTable(doc, {
          startY: currentY,
          body: [['TOTAL DESPESAS', `-${formatCurrencyPDF(totalGeralDespesas)}`]],
          theme: 'grid',
          styles: { 
            fontSize: 10, 
            cellPadding: 4,
            lineColor: [203, 213, 225],
            lineWidth: 0.3
          },
          columnStyles: {
            0: { cellWidth: 132, fontStyle: 'bold', textColor: [220, 38, 38] },
            1: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
          },
          bodyStyles: { fillColor: [254, 242, 242] }, // red-50
          margin: { left: 14, right: 14 }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Saldo final em tabela
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      
      autoTable(doc, {
        startY: currentY,
        body: [['SALDO FINAL', formatCurrencyPDF(filteredSaldoFinal)]],
        theme: 'grid',
        styles: { 
          fontSize: 11, 
          cellPadding: 5,
          lineColor: [203, 213, 225],
          lineWidth: 0.3
        },
        columnStyles: {
          0: { cellWidth: 132, fontStyle: 'bold', textColor: [51, 65, 85] },
          1: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: filteredSaldoFinal >= 0 ? [22, 163, 74] : [220, 38, 38] }
        },
        bodyStyles: { fillColor: [241, 245, 249] }, // slate-100
        margin: { left: 14, right: 14 }
      });
      
      // Salvar PDF
      const nomeArquivo = `relatorio-financeiro-${periodo.replace(/\//g, '-')}.pdf`;
      doc.save(nomeArquivo);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: `Arquivo ${nomeArquivo} baixado.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const formatCurrencyPDF = (value: number) => {
    return `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; 
  };

  // Filtrar contas baseado nos filtros
  const filteredAccounts = accounts.filter(account => {
    // Excluir contas de saldo anterior
    if (account.description === "Saldo Anterior") return false;
    
    // Parse da data corrigido - usar split para evitar problemas de timezone
    const dateParts = account.dueDate.split('-');
    const accountYear = parseInt(dateParts[0], 10);
    const accountMonth = parseInt(dateParts[1], 10); // Já é 1-12

    // Melhorar a pesquisa por texto - buscar tanto na descrição quanto na categoria
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === '' || 
                         account.description.toLowerCase().includes(searchLower) ||
                         account.category.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;
    const matchesType = typeFilter === 'todos' || account.type === typeFilter;
    const matchesMonth = isAnnualView ? true : (monthFilter === 'todos' || accountMonth === parseInt(monthFilter, 10));
    const matchesYear = yearFilter === 'todos' || accountYear === parseInt(yearFilter, 10);
    
    return matchesSearch && matchesStatus && matchesType && matchesMonth && matchesYear;
  });

  // Calcular dados anuais por categoria (para a view Anual)
  const annualCategoryData = useMemo(() => {
    if (!isAnnualView) return { receitas: [], despesas: [], totalReceitas: 0, totalDespesas: 0 };
    
    const yearNum = parseInt(yearFilter, 10);
    
    // Filtrar contas do ano selecionado
    const yearAccounts = accounts.filter(acc => {
      if (acc.description === "Saldo Anterior") return false;
      const dateParts = acc.dueDate.split('-');
      const accYear = parseInt(dateParts[0], 10);
      return accYear === yearNum;
    });

    // Agrupar por categoria e tipo
    const categoryGroups: Record<string, { 
      category: string; 
      type: 'receita' | 'despesa';
      total: number;
      count: number;
    }> = {};

    yearAccounts.forEach(acc => {
      const key = `${acc.category}-${acc.type}`;
      if (!categoryGroups[key]) {
        categoryGroups[key] = {
          category: acc.category,
          type: acc.type as 'receita' | 'despesa',
          total: 0,
          count: 0
        };
      }
      // Somar apenas contas pagas/recebidas
      if ((acc.type === 'receita' && acc.status === 'recebido') || 
          (acc.type === 'despesa' && acc.status === 'pago')) {
        categoryGroups[key].total += Math.abs(acc.amount);
      }
      categoryGroups[key].count++;
    });

    const receitas = Object.values(categoryGroups)
      .filter(g => g.type === 'receita')
      .sort((a, b) => b.total - a.total);
    
    const despesas = Object.values(categoryGroups)
      .filter(g => g.type === 'despesa')
      .sort((a, b) => b.total - a.total);

    const totalReceitas = receitas.reduce((sum, g) => sum + g.total, 0);
    const totalDespesas = despesas.reduce((sum, g) => sum + g.total, 0);

    return { receitas, despesas, totalReceitas, totalDespesas };
  }, [isAnnualView, yearFilter, accounts]);

  // Calcular total filtrado baseado no tipo selecionado (apenas para contas pagas/recebidas)
  const getFilteredTotal = () => {
    if (typeFilter === 'receita') {
      return filteredAccounts
        .filter(account => account.type === 'receita' && account.status === 'recebido')
        .reduce((sum, account) => sum + account.amount, 0);
    } else if (typeFilter === 'despesa') {
      return filteredAccounts
        .filter(account => account.type === 'despesa' && account.status === 'pago')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    }
    return null;
  };

  // Calcular total baseado no status selecionado
  const getStatusTotal = () => {
    if (statusFilter === 'pendente') {
      return filteredAccounts
        .filter(account => account.status === 'pendente')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    } else if (statusFilter === 'pago') {
      return filteredAccounts
        .filter(account => account.status === 'pago')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    } else if (statusFilter === 'recebido') {
      return filteredAccounts
        .filter(account => account.status === 'recebido')
        .reduce((sum, account) => sum + account.amount, 0);
    }
    return null;
  };

  // Calcular valores filtrados para os cards
  const getFilteredReceitas = () => {
    return filteredAccounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const getFilteredDespesas = () => {
    return filteredAccounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  // Calcular saldo final incluindo saldo anterior
  const getFilteredSaldoFinal = () => {
    return previousBalance + getFilteredReceitas() - getFilteredDespesas();
  };

  const filteredTotal = getFilteredTotal();
  const statusTotal = getStatusTotal();
  const filteredReceitas = getFilteredReceitas();
  const filteredDespesas = getFilteredDespesas();
  const filteredSaldoFinal = getFilteredSaldoFinal();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'recebido':
        return 'Recebido';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // Mobile render
  if (isMobile) {
    return (
      <Layout>
        <div className="px-4 py-4 space-y-4">
          {/* Menu Principal Button */}
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Menu size={18} />
            Menu Principal
          </Button>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/contas')}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Contas
            </Button>
            <Button
              onClick={handleExportPDF}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Download size={16} className="mr-1" />
              PDF
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>

          {/* Filtro de Status */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos Status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="recebido">Recebido</option>
            </select>
          </div>

          {/* Botões Hoje, Anual, Todos */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAnnualView(false);
                const today = new Date();
                setMonthFilter((today.getMonth() + 1).toString());
                setYearFilter(today.getFullYear().toString());
              }}
              className="flex-1 flex items-center justify-center gap-1 h-9 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700"
            >
              <Calendar size={14} />
              Hoje
            </Button>
            <Button
              variant={isAnnualView ? "default" : "outline"}
              size="sm"
              onClick={handleAnnualView}
              className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-full transition-colors ${
                isAnnualView 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              <Calendar size={14} />
              Anual
            </Button>
            <Button
              variant={isShowingAll && !isAnnualView ? "default" : "outline"}
              size="sm"
              onClick={handleShowAll}
              className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-full transition-colors ${
                isShowingAll && !isAnnualView
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              Todos
            </Button>
          </div>

          {/* Month/Year Stepper ou Seletor Anual */}
          {isAnnualView ? (
            <div className="flex items-center justify-center gap-4 py-3 bg-purple-50 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setYearFilter((parseInt(yearFilter) - 1).toString())}
              >
                <ArrowLeft size={14} />
              </Button>
              <span className="text-base font-bold text-purple-700">
                Anual - {yearFilter}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setYearFilter((parseInt(yearFilter) + 1).toString())}
              >
                <ArrowLeft size={14} className="rotate-180" />
              </Button>
            </div>
          ) : (
            <MonthYearStepperMobile
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
              isShowingAll={isShowingAll}
            />
          )}

          {/* Summary Cards */}
          <ReportsSummaryCardsMobile
            previousBalance={previousBalance}
            totalReceitas={filteredReceitas}
            totalDespesas={filteredDespesas}
            saldoFinal={filteredSaldoFinal}
          />

          {/* Resultados da Pesquisa */}
          {searchTerm && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-blue-600" />
                <span className="text-xs text-blue-800">
                  "{searchTerm}" - {filteredAccounts.length} conta(s)
                </span>
              </div>
            </div>
          )}

          {/* Lista de Contas ou Relatório Anual */}
          {isAnnualView ? (
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              {/* Seção de Receitas */}
              {annualCategoryData.receitas.length > 0 && (
                <>
                  <div className="bg-white border-b-2 border-slate-400 px-3 py-2">
                    <span className="font-bold text-slate-900 text-sm">RECEITAS - {yearFilter}</span>
                  </div>
                  {annualCategoryData.receitas.map((group, index) => (
                    <div key={`receita-m-${group.category}-${index}`} className="flex justify-between items-center px-3 py-2 border-b border-slate-200 bg-white hover:bg-slate-50">
                      <span className="text-sm text-slate-700 font-medium">{group.category}</span>
                      <span className="font-semibold text-blue-600 text-sm">
                        +R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="bg-slate-100 px-3 py-2 border-b-2 border-slate-400 flex justify-between">
                    <span className="font-bold text-slate-900 text-sm">Total Receitas:</span>
                    <span className="font-bold text-blue-600 text-sm">
                      +R$ {annualCategoryData.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}

              {/* Seção de Despesas */}
              {annualCategoryData.despesas.length > 0 && (
                <>
                  <div className="bg-white border-b-2 border-slate-400 px-3 py-2">
                    <span className="font-bold text-slate-900 text-sm">DESPESAS - {yearFilter}</span>
                  </div>
                  {annualCategoryData.despesas.map((group, index) => (
                    <div key={`despesa-m-${group.category}-${index}`} className="flex justify-between items-center px-3 py-2 border-b border-slate-200 bg-white hover:bg-slate-50">
                      <span className="text-sm text-slate-700 font-medium">{group.category}</span>
                      <span className="font-semibold text-red-600 text-sm">
                        -R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="bg-slate-100 px-3 py-2 border-b-2 border-slate-400 flex justify-between">
                    <span className="font-bold text-slate-900 text-sm">Total Despesas:</span>
                    <span className="font-bold text-red-600 text-sm">
                      -R$ {annualCategoryData.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}

              {/* Saldo Final */}
              <div className="bg-slate-100 px-3 py-3 flex justify-between">
                <span className="font-bold text-slate-900 text-sm">SALDO ANUAL ({yearFilter}):</span>
                <span className={`font-bold text-base ${(annualCategoryData.totalReceitas - annualCategoryData.totalDespesas) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {(annualCategoryData.totalReceitas - annualCategoryData.totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Mensagem vazia */}
              {annualCategoryData.receitas.length === 0 && annualCategoryData.despesas.length === 0 && (
                <div className="px-3 py-6 text-center text-slate-500 text-sm">
                  Nenhuma conta encontrada para o ano {yearFilter}.
                </div>
              )}
            </div>
          ) : (
            <ReportsListMobile accounts={filteredAccounts} />
          )}
        </div>
      </Layout>
    );
  }

  // Desktop render
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-start items-center gap-3">
          <Button 
            onClick={() => navigate('/contas')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar para Contas
          </Button>
          <Button 
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Download size={20} className="mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Alerta de Despesas Vencendo */}
        <ExpiringAccountsAlert />

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Saldo Anterior */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Wallet className="text-purple-600" size={22} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Saldo Anterior</h3>
                <p className={`text-xl font-bold ${previousBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  R$ {previousBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Total de Receitas */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="text-green-600" size={22} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Total Recebido</h3>
                <p className="text-xl font-bold text-green-600">R$ {filteredReceitas.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Total de Despesas */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown className="text-red-600" size={22} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Total Pago</h3>
                <p className="text-xl font-bold text-red-600">R$ {filteredDespesas.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Saldo Final */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="text-blue-600" size={22} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Saldo Final</h3>
                <p className={`text-xl font-bold ${filteredSaldoFinal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {filteredSaldoFinal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Planilha de Contas */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Todas as Contas</h3>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Pesquisar por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MonthNavigator com botão Anual integrado */}
            <MonthNavigator
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
              onShowAll={handleShowAll}
              isShowingAll={isShowingAll}
              onAnnualView={handleAnnualView}
              isAnnualView={isAnnualView}
            />

            {/* Seletor de Ano para Vista Anual */}
            {isAnnualView && (
              <div className="flex items-center justify-center gap-4 py-4 mb-4 bg-purple-50 rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYearFilter((parseInt(yearFilter) - 1).toString())}
                >
                  <ArrowLeft size={16} />
                </Button>
                <span className="text-lg font-bold text-slate-900">
                  Relatório Anual - {yearFilter}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYearFilter((parseInt(yearFilter) + 1).toString())}
                >
                  <ArrowLeft size={16} className="rotate-180" />
                </Button>
              </div>
            )}

            {/* Campo de Total por Status */}
            {statusTotal !== null && (
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Total de Contas {statusFilter === 'pendente' ? 'Pendentes' : statusFilter === 'pago' ? 'Pagas' : 'Recebidas'}:
                  </span>
                  <span className={`text-xl font-bold ${
                    statusFilter === 'recebido' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    R$ {statusTotal.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  * Total filtrado por status: {statusFilter}
                </div>
              </div>
            )}

            {/* Campo de Total Filtrado por Tipo */}
            {filteredTotal !== null && (
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Total de {typeFilter === 'receita' ? 'Receitas Recebidas' : 'Despesas Pagas'} Filtradas:
                  </span>
                  <span className={`text-xl font-bold ${
                    typeFilter === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {filteredTotal.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  * Não inclui contas pendentes no cálculo
                </div>
              </div>
            )}


            {/* Mostrar informação da pesquisa quando há termo de busca */}
            {searchTerm && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Resultados para: "<strong>{searchTerm}</strong>" - {filteredAccounts.length} conta(s) encontrada(s)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tabela de Relatório Anual por Categoria */}
          {isAnnualView ? (
            <div className="overflow-x-auto">
              <div className="border border-slate-300 rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="text-left font-semibold text-slate-700 px-4 py-3 border-r border-slate-300 text-sm">Categoria</th>
                      <th className="text-left font-semibold text-slate-700 px-4 py-3 border-r border-slate-300 text-sm">Qtd. Contas</th>
                      <th className="text-right font-semibold text-slate-700 px-4 py-3 text-sm">Total Anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Seção de Receitas */}
                    {annualCategoryData.receitas.length > 0 && (
                      <>
                        <tr className="bg-white border-t-2 border-slate-400">
                          <td colSpan={3} className="px-4 py-3 font-bold text-slate-900 text-base">
                            RECEITAS - {yearFilter}
                          </td>
                        </tr>
                        {annualCategoryData.receitas.map((group, index) => (
                          <tr key={`receita-${group.category}-${index}`} className="hover:bg-slate-50 border-b border-slate-200">
                            <td className="px-4 py-3 border-r border-slate-200 text-sm">
                              <span className="text-slate-700 font-medium">{group.category}</span>
                            </td>
                            <td className="px-4 py-3 border-r border-slate-200 text-sm text-left">
                              <span className="text-slate-600">{group.count}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className="font-semibold text-blue-600">
                                +R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 border-b-2 border-slate-400">
                          <td className="px-4 py-3 font-bold text-slate-900 text-left">
                            Total Receitas:
                          </td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-blue-600 text-lg">
                              +R$ {annualCategoryData.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      </>
                    )}

                    {/* Seção de Despesas */}
                    {annualCategoryData.despesas.length > 0 && (
                      <>
                        <tr className="bg-white border-t-2 border-slate-400">
                          <td colSpan={3} className="px-4 py-3 font-bold text-slate-900 text-base">
                            DESPESAS - {yearFilter}
                          </td>
                        </tr>
                        {annualCategoryData.despesas.map((group, index) => (
                          <tr key={`despesa-${group.category}-${index}`} className="hover:bg-slate-50 border-b border-slate-200">
                            <td className="px-4 py-3 border-r border-slate-200 text-sm">
                              <span className="text-slate-700 font-medium">{group.category}</span>
                            </td>
                            <td className="px-4 py-3 border-r border-slate-200 text-sm text-left">
                              <span className="text-slate-600">{group.count}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className="font-semibold text-red-600">
                                -R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 border-b-2 border-slate-400">
                          <td className="px-4 py-3 font-bold text-slate-900 text-left">
                            Total Despesas:
                          </td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-red-600 text-lg">
                              -R$ {annualCategoryData.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      </>
                    )}

                    {/* Saldo Final Anual */}
                    <tr className="bg-slate-100 border-t-2 border-slate-500">
                      <td className="px-4 py-4 font-bold text-slate-900 text-left text-base">
                        SALDO ANUAL ({yearFilter}):
                      </td>
                      <td className="px-4 py-4"></td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-bold text-xl ${(annualCategoryData.totalReceitas - annualCategoryData.totalDespesas) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          R$ {(annualCategoryData.totalReceitas - annualCategoryData.totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>

                    {/* Mensagem de dados vazios */}
                    {annualCategoryData.receitas.length === 0 && annualCategoryData.despesas.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                          Nenhuma conta encontrada para o ano {yearFilter}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="border border-slate-300 rounded-lg">
                {(() => {
                  // Agrupar contas por categoria e tipo
                  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
                    const key = `${account.category}-${account.type}`;
                    if (!acc[key]) {
                      acc[key] = {
                        category: account.category,
                        type: account.type,
                        accounts: []
                      };
                    }
                    acc[key].accounts.push(account);
                    return acc;
                  }, {} as Record<string, { category: string; type: string; accounts: typeof filteredAccounts }>);

                  // Ordenar contas por data de vencimento crescente dentro de cada grupo
                  Object.values(groupedAccounts).forEach(group => {
                    group.accounts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                  });

                  // Ordenar grupos: primeiro receitas, depois despesas, e alfabeticamente por categoria
                  const sortedGroups = Object.values(groupedAccounts).sort((a, b) => {
                    if (a.type !== b.type) {
                      return a.type === 'receita' ? -1 : 1;
                    }
                    return a.category.localeCompare(b.category);
                  });

                  return (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="text-left font-semibold text-slate-700 px-4 py-3 border-r border-slate-300 text-sm">Descrição</th>
                          <th className="text-left font-semibold text-slate-700 px-2 py-3 border-r border-slate-300 text-sm">Categoria</th>
                          <th className="text-left font-semibold text-slate-700 px-2 py-3 border-r border-slate-300 text-sm">Tipo</th>
                          <th className="text-left font-semibold text-slate-700 px-2 py-3 border-r border-slate-300 text-sm">Valor</th>
                          <th className="text-left font-semibold text-slate-700 px-2 py-3 border-r border-slate-300 text-sm">Vencimento</th>
                          <th className="text-left font-semibold text-slate-700 px-2 py-3 border-r border-slate-300 text-sm">Fonte Pagamento</th>
                          <th className="text-left font-semibold text-slate-700 px-2 py-3 text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedGroups.length > 0 ? (
                          sortedGroups.map((group, groupIndex) => {
                            const groupTotal = group.accounts.reduce((sum, acc) => sum + Math.abs(acc.amount), 0);
                            
                            return (
                              <React.Fragment key={`${group.category}-${group.type}-${groupIndex}`}>
                                {/* Linha de cabeçalho do grupo */}
                                <tr className="bg-white border-t-2 border-slate-400 border-b-2 border-b-slate-400">
                                  <td colSpan={7} className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-base text-slate-900">
                                        {group.category}
                                      </span>
                                      <span className="text-slate-600">-</span>
                                      <span className="font-semibold text-slate-700">
                                        {group.type === 'receita' ? 'Receitas' : 'Despesas'}
                                      </span>
                                      <span className="text-xs font-medium text-slate-600 ml-2">
                                        ({group.accounts.length} {group.accounts.length === 1 ? 'item' : 'itens'})
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                                
                                {/* Linhas de itens do grupo */}
                                {group.accounts.map((account, index) => (
                                  <tr 
                                    key={`${account.id}-${index}`} 
                                    className="hover:bg-slate-50 border-b border-slate-200"
                                  >
                                    <td className="px-4 py-2 border-r border-slate-200 text-sm">
                                      <span className="text-slate-700">{account.description}</span>
                                    </td>
                                    <td className="px-2 py-2 border-r border-slate-200 text-sm">
                                      <span className="text-slate-600">{account.category}</span>
                                    </td>
                                    <td className="px-2 py-2 border-r border-slate-200 text-sm">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        account.type === 'receita' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {account.type === 'receita' ? 'Receita' : 'Despesa'}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 border-r border-slate-200 text-sm text-left">
                                      <span className={`font-semibold ${
                                        account.type === 'receita' ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {account.type === 'receita' ? '+' : '-'}R$ {Math.abs(account.amount).toFixed(2)}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 border-r border-slate-200 text-sm text-left">
                                      <span className="text-slate-600">{formatDate(account.dueDate)}</span>
                                    </td>
                                    <td className="px-2 py-2 border-r border-slate-200 text-sm text-left">
                                      <span className="text-slate-600">{account.payment_source_name || '-'}</span>
                                    </td>
                                    <td className="px-2 py-2 text-sm text-left">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                                        {getStatusLabel(account.status)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                                
                                {/* Linha de total do grupo */}
                                <tr className="bg-slate-100 border-b-2 border-slate-400">
                                  <td colSpan={7} className="px-4 py-3 text-left font-bold text-slate-900">
                                    Total {group.category}: <span className={group.type === 'receita' ? 'text-green-600' : 'text-red-600'}>{group.type === 'receita' ? '+' : '-'}R$ {groupTotal.toFixed(2)}</span>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                              {searchTerm ? 
                                `Nenhuma conta encontrada para "${searchTerm}".` : 
                                'Nenhuma conta encontrada com os filtros aplicados.'
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
