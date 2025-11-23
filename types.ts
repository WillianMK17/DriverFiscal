export interface MonthlyRecord {
  id: string;
  month: number; // 0-11
  year: number;
  grossRevenue: number;
  inssPaid: number;
  otherDeductions: number;
  // New fields for INSS Module state persistence
  inssPlanType?: '11%' | '20%';
  inssBaseAmount?: number;
}

export interface TaxCalculation {
  exemptAmount: number;
  taxableIncome: number; // gross * 0.6
  deductionsTotal: number;
  taxBase: number; // taxableIncome - deductions
  taxDue: number;
  effectiveRate: number;
  isAboveThreshold: boolean;
  taxLimit: number;
  // Detailed breakdown fields
  taxRate: number; // The percentage applied (0, 7.5, 15, etc.)
  standardDeduction: number; // The "Parcela a Deduzir" from the government table
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum CalculationConstants {
  EXEMPTION_PERCENTAGE = 0.40, // 40% is exempt
  TAXABLE_PERCENTAGE = 0.60,   // 60% is taxable
  // Standard IRPF threshold for 2024/2025
  TAXABLE_THRESHOLD = 2259.20,
  MIN_WAGE = 1412.00,
  INSS_CEILING = 7786.02
}

export type InssPlanType = '11%' | '20%';