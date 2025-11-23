import { MonthlyRecord, TaxCalculation, CalculationConstants, InssPlanType } from '../types';

export const getIrpfDetails = (base: number): { tax: number, rate: number, deduction: number } => {
  if (base <= 2259.20) return { tax: 0, rate: 0, deduction: 0 };
  if (base <= 2826.65) return { tax: (base * 0.075) - 169.44, rate: 7.5, deduction: 169.44 };
  if (base <= 3751.05) return { tax: (base * 0.15) - 381.44, rate: 15.0, deduction: 381.44 };
  if (base <= 4664.68) return { tax: (base * 0.225) - 662.77, rate: 22.5, deduction: 662.77 };
  return { tax: (base * 0.275) - 896.00, rate: 27.5, deduction: 896.00 };
};

export const calculateTax = (grossRevenue: number, inss: number = 0, otherDeductions: number = 0): TaxCalculation => {
  const exemptAmount = grossRevenue * CalculationConstants.EXEMPTION_PERCENTAGE;
  const taxableIncome = grossRevenue * CalculationConstants.TAXABLE_PERCENTAGE; // 60%
  
  const deductionsTotal = inss + otherDeductions;
  const taxBase = Math.max(0, taxableIncome - deductionsTotal);
  
  const irpfDetails = getIrpfDetails(taxBase);
  
  // Threshold logic: Using the base bracket limit for alerting
  const isAboveThreshold = taxBase > CalculationConstants.TAXABLE_THRESHOLD;
  
  const effectiveRate = grossRevenue > 0 ? (irpfDetails.tax / grossRevenue) * 100 : 0;

  return {
    exemptAmount,
    taxableIncome,
    deductionsTotal,
    taxBase,
    taxDue: irpfDetails.tax,
    effectiveRate,
    isAboveThreshold,
    taxLimit: CalculationConstants.TAXABLE_THRESHOLD,
    taxRate: irpfDetails.rate,
    standardDeduction: irpfDetails.deduction
  };
};

export const calculateGPS = (base: number, plan: InssPlanType): number => {
  // Plan 11% (Simplificado) is strictly on Minimum Wage
  if (plan === '11%') {
    return CalculationConstants.MIN_WAGE * 0.11;
  }
  
  // Plan 20% (Normal) is on Base (Min Wage to Ceiling)
  const validBase = Math.max(CalculationConstants.MIN_WAGE, Math.min(base, CalculationConstants.INSS_CEILING));
  return validBase * 0.20;
};

export const getAnnualSummary = (records: MonthlyRecord[]) => {
  return records.reduce((acc, record) => {
    const calc = calculateTax(record.grossRevenue, record.inssPaid, record.otherDeductions);
    return {
      grossTotal: acc.grossTotal + record.grossRevenue,
      exemptTotal: acc.exemptTotal + calc.exemptAmount,
      taxableTotal: acc.taxableTotal + calc.taxableIncome,
      taxDueTotal: acc.taxDueTotal + calc.taxDue
    };
  }, { grossTotal: 0, exemptTotal: 0, taxableTotal: 0, taxDueTotal: 0 });
};

export const getDarfDueDate = (month: number, year: number): string => {
  // Due date is the last business day of the next month
  const nextMonth = month + 1;
  const nextYear = nextMonth > 11 ? year + 1 : year;
  const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;
  
  const lastDay = new Date(nextYear, adjustedMonth + 1, 0);
  // Simple check for weekend (not full holiday logic)
  if (lastDay.getDay() === 6) lastDay.setDate(lastDay.getDate() - 1); // Saturday -> Friday
  if (lastDay.getDay() === 0) lastDay.setDate(lastDay.getDate() - 2); // Sunday -> Friday
  
  return lastDay.toLocaleDateString('pt-BR');
};

export const getGpsDueDate = (month: number, year: number): string => {
  // GPS is due on the 15th of the next month
  const nextMonth = month + 1;
  const nextYear = nextMonth > 11 ? year + 1 : year;
  const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;
  
  const dueDay = new Date(nextYear, adjustedMonth, 15);
  // If 15th is weekend/holiday, it usually postpones to next business day
  if (dueDay.getDay() === 6) dueDay.setDate(dueDay.getDate() + 2); // Sat -> Mon
  if (dueDay.getDay() === 0) dueDay.setDate(dueDay.getDate() + 1); // Sun -> Mon
  
  return dueDay.toLocaleDateString('pt-BR');
};