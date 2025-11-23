import React, { useState } from 'react';
import { TaxCalculation, MonthlyRecord } from '../types';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { getDarfDueDate } from '../utils/taxCalculations';

interface TaxSummaryProps {
  calculation: TaxCalculation;
  record: MonthlyRecord;
}

export const TaxSummary: React.FC<TaxSummaryProps> = ({ calculation, record }) => {
  const [showTable, setShowTable] = useState(false);
  const dueDate = getDarfDueDate(record.month, record.year);
  const limitPercentage = Math.min((calculation.taxBase / calculation.taxLimit) * 100, 100);
  const isWarning = limitPercentage > 80 && !calculation.isAboveThreshold;

  const generateReportText = () => {
    return `
MOTORISTA TAX - RELATÓRIO MENSAL DE APURAÇÃO
================================================
Período: ${getMonthName(record.month).toUpperCase()}/${record.year}
Data de Geração: ${new Date().toLocaleDateString('pt-BR')}

1. RECEITAS DA ATIVIDADE
------------------------------------------------
Receita Bruta Total:      ${formatCurrency(record.grossRevenue)}
Parcela Isenta (40%):     ${formatCurrency(calculation.exemptAmount)}
Parcela Tributável (60%): ${formatCurrency(calculation.taxableIncome)}

2. DEDUÇÕES LEGAIS
------------------------------------------------
Contribuição INSS (GPS):  ${formatCurrency(record.inssPaid)}
Outras Deduções:          ${formatCurrency(record.otherDeductions)}
Total de Deduções:        ${formatCurrency(calculation.deductionsTotal)}

3. CÁLCULO DO IMPOSTO (CARNÊ-LEÃO)
------------------------------------------------
Base de Cálculo:          ${formatCurrency(calculation.taxBase)}
(Receita Tributável - Deduções)

Alíquota Aplicada:        ${calculation.taxRate}%
Imposto Bruto:            ${formatCurrency(calculation.taxBase * (calculation.taxRate / 100))}
(-) Parcela a Deduzir:    ${formatCurrency(calculation.standardDeduction)}

------------------------------------------------
RESULTADO FINAL
------------------------------------------------
IMPOSTO A PAGAR (DARF):   ${formatCurrency(calculation.taxDue)}
VENCIMENTO DO DARF:       ${dueDate}
------------------------------------------------

* Este relatório é um simulativo para auxílio mensal.
* O código da receita para DARF Carnê-Leão é 0190.
    `.trim();
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    alert("Relatório copiado para a área de transferência!");
  };

  const downloadReport = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Fiscal_${record.month + 1}_${record.year}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full relative">
      
      {/* Top Status Bar */}
      <div className={`h-2 w-full ${
        calculation.isAboveThreshold ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
      }`}></div>

      <div className="p-8 flex flex-col h-full overflow-y-auto">
        
        <div className="flex justify-between items-start mb-8">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resultado do Mês</h3>
                <div className="flex items-baseline gap-2">
                     <span className={`text-4xl font-bold tracking-tight ${
                        calculation.taxDue > 0 ? 'text-white' : 'text-emerald-400'
                     }`}>
                        {formatCurrency(calculation.taxDue)}
                     </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    {calculation.taxDue > 0 ? 'Imposto a Pagar (DARF)' : 'Isento de IRPF'}
                </p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={copyReport}
                    className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors text-slate-300 group relative"
                    title="Copiar Relatório"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Copiar
                    </span>
                </button>
                <button 
                    onClick={downloadReport}
                    className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl transition-colors text-white shadow-lg shadow-blue-600/20 group relative"
                    title="Baixar Relatório"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Baixar TXT
                    </span>
                </button>
            </div>
        </div>

        {/* Alerts */}
        {calculation.isAboveThreshold && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    DARF Obrigatório
                </div>
                <p className="text-xs text-red-300/80">O pagamento deve ser feito até {dueDate}.</p>
            </div>
        )}

        {/* Detailed Breakdown */}
        <div className="flex-1 space-y-4">
             <div className="flex justify-between items-center text-sm">
                 <span className="text-emerald-400 font-medium">Receita Tributável (60%)</span>
                 <span className="text-white font-medium">{formatCurrency(calculation.taxableIncome)}</span>
             </div>
             
             <div className="space-y-2 pl-4 border-l-2 border-slate-800/50 text-xs">
                <div className="flex justify-between items-center">
                    <span className="text-amber-500/90">(-) INSS (GPS)</span>
                    <span className="text-amber-400/80">{formatCurrency(record.inssPaid)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">(-) Outras Deduções</span>
                    <span className="text-slate-400">{formatCurrency(record.otherDeductions)}</span>
                </div>
             </div>

             <div className="pt-2 flex justify-between items-center">
                 <span className="text-sm font-bold text-blue-400">(=) Base de Cálculo</span>
                 <span className="text-lg font-bold text-white">{formatCurrency(calculation.taxBase)}</span>
             </div>

             {/* Calculation Logic */}
             <div className="bg-slate-800/50 p-3 rounded-lg text-xs space-y-2 border border-slate-800">
                <div className="flex justify-between items-center text-slate-400">
                    <span>Alíquota Aplicada</span>
                    <span className="font-mono text-white">{calculation.taxRate}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                    <span>Imposto Bruto (Base x Alíquota)</span>
                    <span className="font-mono text-white">{formatCurrency(calculation.taxBase * (calculation.taxRate / 100))}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400/80">
                    <span>(-) Parcela a Deduzir (Tabela)</span>
                    <span className="font-mono">{formatCurrency(calculation.standardDeduction)}</span>
                </div>
             </div>
        </div>

        {/* Toggle Table */}
        <div className="mt-6 pt-4 border-t border-slate-800">
            <button 
                onClick={() => setShowTable(!showTable)}
                className="flex items-center justify-center w-full gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider mb-4"
            >
                {showTable ? 'Ocultar Tabela' : 'Ver Tabela Progressiva 2024'}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showTable ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showTable && (
                <div className="overflow-x-auto animate-fade-in-down">
                    <table className="w-full text-xs text-left text-slate-400">
                        <thead className="text-[10px] text-slate-500 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-2 py-2 rounded-l-lg">Base de Cálculo (R$)</th>
                                <th className="px-2 py-2">Alíquota</th>
                                <th className="px-2 py-2 rounded-r-lg">Dedução (R$)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            <tr className={calculation.taxRate === 0 ? 'bg-emerald-900/20 text-emerald-200' : ''}>
                                <td className="px-2 py-2">Até 2.259,20</td>
                                <td className="px-2 py-2">Isento</td>
                                <td className="px-2 py-2">0,00</td>
                            </tr>
                            <tr className={calculation.taxRate === 7.5 ? 'bg-emerald-900/20 text-emerald-200' : ''}>
                                <td className="px-2 py-2">2.259,21 até 2.826,65</td>
                                <td className="px-2 py-2">7,5%</td>
                                <td className="px-2 py-2">169,44</td>
                            </tr>
                            <tr className={calculation.taxRate === 15 ? 'bg-emerald-900/20 text-emerald-200' : ''}>
                                <td className="px-2 py-2">2.826,66 até 3.751,05</td>
                                <td className="px-2 py-2">15,0%</td>
                                <td className="px-2 py-2">381,44</td>
                            </tr>
                            <tr className={calculation.taxRate === 22.5 ? 'bg-emerald-900/20 text-emerald-200' : ''}>
                                <td className="px-2 py-2">3.751,06 até 4.664,68</td>
                                <td className="px-2 py-2">22,5%</td>
                                <td className="px-2 py-2">662,77</td>
                            </tr>
                            <tr className={calculation.taxRate === 27.5 ? 'bg-emerald-900/20 text-emerald-200' : ''}>
                                <td className="px-2 py-2">Acima de 4.664,68</td>
                                <td className="px-2 py-2">27,5%</td>
                                <td className="px-2 py-2">896,00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};