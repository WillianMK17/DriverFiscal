import React, { useState, useMemo } from 'react';
import { MonthlyRecord, TaxCalculation, CalculationConstants } from './types';
import { calculateTax } from './utils/taxCalculations';
import { formatCurrency, getMonthName } from './utils/formatters';
import { RevenueInput } from './components/RevenueInput';
import { InssInput } from './components/InssModule';
import { TaxSummary } from './components/SummaryCard';
import { AiAssistant } from './components/AiAssistant';

const App: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(new Date().getMonth());
  const [records, setRecords] = useState<MonthlyRecord[]>([]);

  const getActiveRecord = (): MonthlyRecord => {
    const existing = records.find(r => r.month === activeMonthIndex && r.year === currentYear);
    if (existing) return existing;
    
    return {
      id: `temp-${activeMonthIndex}-${currentYear}`,
      month: activeMonthIndex,
      year: currentYear,
      grossRevenue: 0,
      inssPaid: 0,
      otherDeductions: 0,
      inssPlanType: '11%',
      inssBaseAmount: CalculationConstants.MIN_WAGE
    };
  };

  const activeRecord = getActiveRecord();

  const handleUpdateRecord = (updates: Partial<MonthlyRecord>) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.month === activeMonthIndex && r.year === currentYear);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      } else {
        return [...prev, { ...activeRecord, ...updates, id: Date.now().toString() }];
      }
    });
  };
  
  const calculation: TaxCalculation = useMemo(() => {
    return calculateTax(activeRecord.grossRevenue, activeRecord.inssPaid, activeRecord.otherDeductions);
  }, [activeRecord]);

  const aiContext = useMemo(() => {
    return `
      Mês: ${getMonthName(activeMonthIndex)}.
      Receita: ${formatCurrency(activeRecord.grossRevenue)}.
      INSS: ${formatCurrency(activeRecord.inssPaid)}.
      Base IR: ${formatCurrency(calculation.taxBase)}.
      Imposto: ${formatCurrency(calculation.taxDue)}.
    `;
  }, [activeRecord, activeMonthIndex, calculation]);

  const handleDeductionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    handleUpdateRecord({ otherDeductions: isNaN(val) ? 0 : val });
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 py-4 lg:py-10 px-4 flex justify-center">
      <div className="w-full max-w-6xl">
        
        {/* Top Bar */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 3.666A5.002 5.002 0 0115 7m0 3.666V15m0-7.5a.5.5 0 01.5-.5H18a.5.5 0 01.5.5v2.5a.5.5 0 01-.5.5h-2.5a.5.5 0 01-.5-.5V7.5zM12 15a5.002 5.002 0 00-3-2.077M12 15c1.657 0 3-1.343 3-3M9 15c-1.657 0-3-1.343-3-3M15 7a5.002 5.002 0 01-5 1.588M9 21v-2.5a.5.5 0 01.5-.5H12a.5.5 0 01.5.5V21a.5.5 0 01-.5.5H9.5a.5.5 0 01-.5-.5z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Driver Fiscal</h1>
                    <p className="text-sm text-slate-500 font-medium">Calculadora IRPF & INSS</p>
                </div>
            </div>

            {/* Month Tabs */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex overflow-x-auto max-w-full scrollbar-hide w-full md:w-auto">
                {Array.from({ length: 12 }).map((_, i) => (
                    <button
                    key={i}
                    onClick={() => setActiveMonthIndex(i)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        activeMonthIndex === i 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    >
                    {getMonthName(i).substring(0, 3)}
                    </button>
                ))}
            </div>
        </header>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Inputs */}
            <div className="lg:col-span-7 space-y-6">
                
                <RevenueInput record={activeRecord} onUpdate={handleUpdateRecord} />
                
                <InssInput record={activeRecord} onUpdate={handleUpdateRecord} />

                {/* Other Deductions Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Outras Deduções</h2>
                            <p className="text-xs text-slate-400">Livro caixa, dependentes, pensão</p>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                            Valor Total (R$)
                        </label>
                        <input 
                            type="number" 
                            placeholder="0,00"
                            value={activeRecord.otherDeductions > 0 ? activeRecord.otherDeductions : ''}
                            onChange={handleDeductionsChange}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-5 sticky top-6">
                <TaxSummary calculation={calculation} record={activeRecord} />
            </div>

        </div>
      </div>
      <AiAssistant contextSummary={aiContext} />
    </div>
  );
};

export default App;