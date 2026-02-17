
import { Loan, Investment, Transaction } from '../types';

export const calculateEMI = (principal: number, annualRate: number, tenureMonths: number): number => {
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return emi;
};

export const calculatePayoffProjection = (outstanding: number, annualRate: number, emi: number) => {
  if (outstanding <= 0) return { months: 0, totalInterest: 0 };
  if (annualRate === 0) return { months: Math.ceil(outstanding / emi), totalInterest: 0 };
  
  const monthlyRate = annualRate / 12 / 100;
  
  // Formula: n = -log(1 - (P*r)/E) / log(1 + r)
  // where P is outstanding, r is monthly rate, E is EMI
  const inner = 1 - (outstanding * monthlyRate) / emi;
  
  // If EMI is too low to cover interest, it will never be paid off
  if (inner <= 0) return { months: Infinity, totalInterest: Infinity };
  
  const remainingMonths = -Math.log(inner) / Math.log(1 + monthlyRate);
  const totalPayments = emi * remainingMonths;
  const totalInterest = totalPayments - outstanding;

  return { 
    months: Math.ceil(remainingMonths), 
    totalInterest: Math.max(0, totalInterest) 
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getInvestmentSummary = (investments: Investment[]) => {
  const totalValue = investments.reduce((acc, inv) => acc + (inv.currentPrice * inv.quantity), 0);
  const totalCost = investments.reduce((acc, inv) => acc + (inv.buyPrice * inv.quantity), 0);
  const profitLoss = totalValue - totalCost;
  const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  return { totalValue, profitLoss, profitLossPercentage };
};

export const getLoanSummary = (loans: Loan[]) => {
  const totalOutstanding = loans.reduce((acc, loan) => acc + (loan.principal - loan.paidAmount), 0);
  const totalPrincipal = loans.reduce((acc, loan) => acc + loan.principal, 0);
  return { totalOutstanding, totalPrincipal };
};

export const getExpenseSummary = (transactions: Transaction[]) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const businessTotal = expenses
    .filter(t => t.category === 'Business')
    .reduce((acc, t) => acc + t.amount, 0);
  const personalTotal = expenses
    .filter(t => t.category === 'Personal')
    .reduce((acc, t) => acc + t.amount, 0);
  return { businessTotal, personalTotal, total: businessTotal + personalTotal };
};

export const getIncomeSummary = (transactions: Transaction[]) => {
  const incomes = transactions.filter(t => t.type === 'income');
  const businessTotal = incomes
    .filter(t => t.category === 'Business')
    .reduce((acc, t) => acc + t.amount, 0);
  const personalTotal = incomes
    .filter(t => t.category === 'Personal')
    .reduce((acc, t) => acc + t.amount, 0);
  return { businessTotal, personalTotal, total: businessTotal + personalTotal };
};
