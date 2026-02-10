
export type ExpenseCategory = 'Personal' | 'Business';
export type TransactionType = 'income' | 'expense';

export interface UserProfile {
  name: string;
  phone: string;
  photoUrl: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  subCategory: string;
  description: string;
  date: string;
  sourceId?: string; // ID of the Bank Account, Credit Card, or Wallet
}

export interface BankAccount {
  id: string;
  name: string;
  nickname?: string;
  balance: number;
  type: 'bank';
}

export interface CreditCard {
  id: string;
  name: string;
  nickname?: string;
  limit: number;
  outstanding: number;
  dueDate: number; // Day of month
  type: 'card';
}

export interface Wallet {
  id: string;
  name: string; // e.g., 'Paytm', 'PhonePe'
  nickname?: string;
  balance: number;
  type: 'wallet';
  provider: 'upi' | 'wallet' | 'other';
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  tenure: number;
  paidAmount: number;
  startDate: string;
  reminderDay?: number;
  remindersEnabled?: boolean;
}

export interface Investment {
  id: string;
  name: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  date: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  subCategory: string;
  limit: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  loanId?: string;
}

export interface AppMetadata {
  bankOptions: string[];
  cardOptions: string[];
  walletProviders: string[];
  incomeCategories: Record<ExpenseCategory, string[]>;
  expenseCategories: Record<ExpenseCategory, string[]>;
}

export interface FinancialData {
  transactions: Transaction[];
  loans: Loan[];
  investments: Investment[];
  budgets: Budget[];
  accounts: BankAccount[];
  creditCards: CreditCard[];
  wallets: Wallet[];
  profile?: UserProfile;
  metadata: AppMetadata;
}

export enum View {
  Dashboard = 'dashboard',
  Income = 'income',
  Expenses = 'expenses',
  Liabilities = 'liabilities',
  Investments = 'investments',
  Budgeting = 'budgeting',
  Accounts = 'accounts',
  PaymentMethods = 'payment-methods'
}
