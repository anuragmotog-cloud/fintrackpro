
import React from 'react';
import { 
  LayoutDashboard, Wallet as WalletIcon, TrendingUp, CreditCard, Banknote, PieChart, Landmark,
  ShoppingCart, Home, Zap, Film, Activity, Plane, Package, Users, Megaphone, Cpu, 
  Building2, Scale, HelpCircle, Briefcase, Laptop, Gift, Tag, Handshake, 
  MessageSquare, Award, CircleDollarSign, SmartphoneNfc, Settings as SettingsIcon
} from 'lucide-react';
import { View } from './types';

export const NAVIGATION_ITEMS = [
  { id: View.Dashboard, name: 'FinTrack', icon: <LayoutDashboard size={20} /> },
  { id: View.Income, name: 'Income', icon: <Banknote size={20} /> },
  { id: View.Expenses, name: 'Expenses', icon: <WalletIcon size={20} /> },
  { id: View.PaymentMethods, name: 'Wallets', icon: <SmartphoneNfc size={20} /> },
  { id: View.Accounts, name: 'Banks', icon: <Landmark size={20} /> },
  { id: View.Budgeting, name: 'Budgets', icon: <PieChart size={20} /> },
  { id: View.Liabilities, name: 'Debt', icon: <CreditCard size={20} /> },
  { id: View.Investments, name: 'Invest', icon: <TrendingUp size={20} /> },
  { id: View.Settings, name: 'Settings', icon: <SettingsIcon size={20} /> },
];

export const BANK_OPTIONS = ['HDFC BANK', 'SBI BANK', 'AXIS BANK', 'ICICI BANK', 'Other Bank'];
export const CARD_OPTIONS = ['VISA INFINITE', 'AMEX PLATINUM', 'HDFC REGALIA', 'SBI ELITE', 'Other Card'];
export const WALLET_PROVIDERS = ['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay', 'MobiKwik', 'ZestMoney', 'Other'];

export const EXPENSE_SUB_CATEGORIES = {
  Personal: ['Groceries', 'Rent', 'Utilities', 'Entertainment', 'Healthcare', 'Travel', 'Dining', 'Other'],
  Business: ['Inventory', 'Salaries', 'Marketing', 'Software', 'Office Rent', 'Legal', 'Travel', 'Other']
};

export const INCOME_SUB_CATEGORIES = {
  Personal: ['Salary', 'Freelance', 'Dividends', 'Rental Income', 'Gifts', 'Other'],
  Business: ['Sales', 'Service Revenue', 'Consulting', 'Grants', 'Interest', 'Other']
};

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  // Expenses
  'Groceries': <ShoppingCart size={20} />,
  'Rent': <Home size={20} />,
  'Utilities': <Zap size={20} />,
  'Entertainment': <Film size={20} />,
  'Healthcare': <Activity size={20} />,
  'Travel': <Plane size={20} />,
  'Inventory': <Package size={20} />,
  'Salaries': <Users size={20} />,
  'Marketing': <Megaphone size={20} />,
  'Software': <Cpu size={20} />,
  'Office Rent': <Building2 size={20} />,
  'Legal': <Scale size={20} />,
  
  // Income
  'Salary': <Briefcase size={20} />,
  'Freelance': <Laptop size={20} />,
  'Dividends': <PieChart size={20} />,
  'Rental Income': <Home size={20} />,
  'Gifts': <Gift size={20} />,
  'Sales': <Tag size={20} />,
  'Service Revenue': <Handshake size={20} />,
  'Consulting': <MessageSquare size={20} />,
  'Grants': <Award size={20} />,
  'Interest': <TrendingUp size={20} />,
  
  // Default/Other
  'Other': <HelpCircle size={20} />,
  'default': <CircleDollarSign size={20} />
};

export const getCategoryIcon = (name: string) => {
  return CATEGORY_ICONS[name] || CATEGORY_ICONS['default'];
};
