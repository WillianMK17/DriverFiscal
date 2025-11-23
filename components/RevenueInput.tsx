import React, { useEffect, useState } from 'react';
import { MonthlyRecord, CalculationConstants } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RevenueInputProps {
  record: MonthlyRecord;
  onUpdate: (updates: Partial<MonthlyRecord>) => void;
}

export const RevenueInput: React.FC<RevenueInputProps> = ({ record, onUpdate }) => {
  const [inputValue, setInputValue] = useState<string>(record.grossRevenue > 0 ? record.grossRevenue.toString() : '');

  useEffect(() => {
    setInputValue(record.grossRevenue > 0 ? record.grossRevenue.toString() : '');
  }, [record.id, record.grossRevenue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const numberVal = parseFloat(val);
    if (!isNaN(numberVal)) {
      onUpdate({ grossRevenue: numberVal });
    } else {
      onUpdate({ grossRevenue: 0 });
    }
  };

  const exemptValue = record.grossRevenue * CalculationConstants.EXEMPTION_PERCENTAGE;
  const taxableValue = record.grossRevenue * CalculationConstants.TAXABLE_PERCENTAGE;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Receita Bruta</h2>
          <p className="text-xs text-slate-400">Ganhos totais nos aplicativos</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
          Valor Total (R$)
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="0,00"
          value={inputValue}
          onChange={handleChange}
          className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-3xl font-bold text-slate-800 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* Visualização da Regra 40/60 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Isento (40%)</p>
          </div>
          <p className="text-xl font-bold text-emerald-900">{formatCurrency(exemptValue)}</p>
          <p className="text-[10px] text-emerald-600/80 mt-1">Não paga imposto</p>
        </div>
        
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Tributável (60%)</p>
          </div>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(taxableValue)}</p>
          <p className="text-[10px] text-blue-600/80 mt-1">Base para IR</p>
        </div>
      </div>
    </div>
  );
};