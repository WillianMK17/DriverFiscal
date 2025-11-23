import React, { useEffect, useState } from 'react';
import { MonthlyRecord, CalculationConstants, InssPlanType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateGPS, getGpsDueDate } from '../utils/taxCalculations';

interface InssInputProps {
  record: MonthlyRecord;
  onUpdate: (updates: Partial<MonthlyRecord>) => void;
}

export const InssInput: React.FC<InssInputProps> = ({ record, onUpdate }) => {
  const [plan, setPlan] = useState<InssPlanType>(record.inssPlanType || '11%');
  const [base, setBase] = useState<number>(record.inssBaseAmount || CalculationConstants.MIN_WAGE);
  
  const gpsValue = calculateGPS(base, plan);
  const dueDate = getGpsDueDate(record.month, record.year);

  useEffect(() => {
    setPlan(record.inssPlanType || '11%');
    setBase(record.inssBaseAmount || CalculationConstants.MIN_WAGE);
  }, [record.id]);

  useEffect(() => {
    onUpdate({
      inssPlanType: plan,
      inssBaseAmount: base,
      inssPaid: gpsValue
    });
  }, [plan, base]);

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setBase(val);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">INSS (GPS)</h2>
                <p className="text-xs text-slate-400">Contribuição obrigatória</p>
            </div>
        </div>
        <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vencimento</p>
             <p className="text-sm font-bold text-amber-600">{dueDate}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Plan Selection */}
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Plano de Contribuição</label>
            <div className="grid grid-cols-2 gap-3">
                <button
                onClick={() => setPlan('11%')}
                className={`p-3 rounded-xl border text-left transition-all ${
                    plan === '11%' 
                    ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold ${plan === '11%' ? 'text-amber-900' : 'text-slate-700'}`}>Simplificado</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan === '11%' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>11%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Apenas Salário Mínimo. Aposentadoria por idade.</p>
                </button>

                <button
                onClick={() => setPlan('20%')}
                className={`p-3 rounded-xl border text-left transition-all ${
                    plan === '20%' 
                    ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold ${plan === '20%' ? 'text-amber-900' : 'text-slate-700'}`}>Normal</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan === '20%' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>20%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Sobre qualquer valor. Conta tempo de contribuição.</p>
                </button>
            </div>
        </div>

        {/* Calculation Row */}
        <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 items-center">
            <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Base de Cálculo</label>
                <input
                    type="number"
                    value={base}
                    onChange={handleBaseChange}
                    disabled={plan === '11%'}
                    className={`w-full bg-transparent text-xl font-bold outline-none ${
                        plan === '11%' ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800'
                    }`}
                />
                {plan === '20%' && (
                    <p className="text-[10px] text-slate-400 mt-1">
                        Min: {formatCurrency(CalculationConstants.MIN_WAGE)} - Max: {formatCurrency(CalculationConstants.INSS_CEILING)}
                    </p>
                )}
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex-1 text-right">
                <p className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor da GPS</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(gpsValue)}</p>
            </div>
        </div>
      </div>
    </div>
  );
};