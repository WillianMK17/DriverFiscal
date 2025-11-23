import React from 'react';
import { TaxCalculation } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AlertBannerProps {
  calculation: TaxCalculation;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ calculation }) => {
  const { taxBase, taxLimit, isAboveThreshold, taxDue } = calculation;
  
  // Percentage of the exemption limit used
  const percentage = Math.min((taxBase / taxLimit) * 100, 100);
  
  // Warning zone starts at 80% of the limit
  const isWarning = percentage >= 80 && !isAboveThreshold;

  if (calculation.taxableIncome === 0 && calculation.deductionsTotal === 0 && calculation.taxBase === 0) return null;

  return (
    <div className={`rounded-xl p-6 shadow-sm border mb-6 transition-all duration-300 ${
      isAboveThreshold 
        ? 'bg-red-50 border-red-200' 
        : isWarning 
          ? 'bg-amber-50 border-amber-200'
          : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-bold text-lg ${
          isAboveThreshold ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-slate-700'
        }`}>
          {isAboveThreshold ? '⚠️ DARF Necessário!' : isWarning ? '⚡ Atenção ao Limite' : 'Situação Regular'}
        </h3>
        <span className="text-sm font-medium text-slate-500 hidden md:inline">
          Limite Isenção: {formatCurrency(taxLimit)}
        </span>
      </div>

      <p className={`text-sm mb-4 ${
         isAboveThreshold ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-600'
      }`}>
        {isAboveThreshold 
          ? `Sua Base de Cálculo (${formatCurrency(taxBase)}) ultrapassou o limite de isenção. Você deve recolher R$ ${formatCurrency(taxDue)} via DARF.` 
          : isWarning
          ? `Sua Base de Cálculo está em ${formatCurrency(taxBase)}. Faltam apenas ${formatCurrency(taxLimit - taxBase)} para atingir o limite tributável.`
          : `Você está dentro da faixa de isenção. Base de cálculo atual: ${formatCurrency(taxBase)}.`
        }
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-white rounded-full h-4 overflow-hidden border border-slate-200">
        <div 
          className={`h-full transition-all duration-500 ${
            isAboveThreshold ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};