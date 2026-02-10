
import React, { useState, useEffect, useMemo } from 'react';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import IncomeTracker from './components/IncomeTracker';
import ExpenseTracker from './components/ExpenseTracker';
import BudgetManager from './components/BudgetManager';
import LiabilitiesManager from './components/LiabilitiesManager';
import InvestmentPortfolio from './components/InvestmentPortfolio';
import AccountsManager from './components/AccountsManager';
import WalletsManager from './components/WalletsManager';
import SettingsManager from './components/SettingsManager';
import ProfileModal from './components/ProfileModal';
import GlobalSearchOverlay from './components/GlobalSearchOverlay';
import { View, FinancialData, Transaction, Loan, Investment, Budget, Notification, BankAccount, CreditCard, Wallet, UserProfile, AppMetadata, ExpenseCategory, NotificationPreferences } from './types';
import { Sun, Moon, X, Bell, Search as SearchIcon, Command } from 'lucide-react';
import { calculateEMI, formatCurrency } from './utils/calculations';
import { BANK_OPTIONS, CARD_OPTIONS, WALLET_PROVIDERS, INCOME_SUB_CATEGORIES, EXPENSE_SUB_CATEGORIES } from './constants';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  phone: '+91 90000 00000',
  photoUrl: 'https://picsum.photos/id/64/100/100'
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  budgetWarnings: true,
  emiReminders: true,
  lowBalanceAlerts: true,
  lowBalanceThreshold: 5000
};

const DEFAULT_METADATA: AppMetadata = {
  bankOptions: BANK_OPTIONS,
  cardOptions: CARD_OPTIONS,
  walletProviders: WALLET_PROVIDERS,
  incomeCategories: INCOME_SUB_CATEGORIES,
  expenseCategories: EXPENSE_SUB_CATEGORIES
};

const INITIAL_DATA: FinancialData = {
  transactions: [],
  loans: [],
  investments: [],
  budgets: [],
  accounts: [
    { id: 'acc-default', name: BANK_OPTIONS[0], balance: 0, type: 'bank', nickname: 'Primary Savings' },
  ],
  creditCards: [],
  wallets: [],
  profile: DEFAULT_PROFILE,
  metadata: DEFAULT_METADATA,
  notificationPreferences: DEFAULT_NOTIFICATIONS
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [data, setData] = useState<FinancialData>(() => {
    const saved = localStorage.getItem('fin_track_data_v5');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.profile) parsed.profile = DEFAULT_PROFILE;
      if (!parsed.metadata) parsed.metadata = DEFAULT_METADATA;
      if (!parsed.wallets) parsed.wallets = [];
      if (!parsed.notificationPreferences) parsed.notificationPreferences = DEFAULT_NOTIFICATIONS;
      return parsed;
    }
    return INITIAL_DATA;
  });

  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const prefs = data.notificationPreferences || DEFAULT_NOTIFICATIONS;
    const now = new Date();
    const today = now.getDate();
    const newNotifications: Notification[] = [];

    // EMI Reminders
    if (prefs.emiReminders) {
      data.loans.forEach(loan => {
        if (loan.remindersEnabled && loan.reminderDay === today) {
          const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenure);
          newNotifications.push({
            id: `reminder-${loan.id}-${today}`,
            title: 'Payment Due Today',
            message: `Your EMI of ${formatCurrency(emi)} for "${loan.name}" is due today.`,
            type: 'warning',
            loanId: loan.id
          });
        }
      });
    }

    // Low Balance Alerts
    if (prefs.lowBalanceAlerts) {
      data.accounts.forEach(acc => {
        if (acc.balance < prefs.lowBalanceThreshold) {
          newNotifications.push({
            id: `low-bal-${acc.id}`,
            title: 'Low Balance Alert',
            message: `Your account "${acc.nickname || acc.name}" is below your ${formatCurrency(prefs.lowBalanceThreshold)} threshold.`,
            type: 'warning'
          });
        }
      });
    }

    // Budget Warnings
    if (prefs.budgetWarnings) {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      data.budgets.forEach(budget => {
        const spent = data.transactions
          .filter(t => t.type === 'expense' && t.category === budget.category && t.subCategory === budget.subCategory)
          .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((acc, t) => acc + t.amount, 0);

        if (spent > budget.limit * 0.9) {
          newNotifications.push({
            id: `budget-warn-${budget.id}`,
            title: 'Budget Alert',
            message: `You have used ${((spent/budget.limit)*100).toFixed(0)}% of your "${budget.subCategory}" budget.`,
            type: spent > budget.limit ? 'warning' : 'info'
          });
        }
      });
    }

    setActiveNotifications(newNotifications);
  }, [data]);

  useEffect(() => {
    localStorage.setItem('fin_track_data_v5', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setData(prev => ({ ...prev, profile: newProfile }));
  };

  const handleUpdateNotifications = (newPrefs: NotificationPreferences) => {
    setData(prev => ({ ...prev, notificationPreferences: newPrefs }));
  };

  const resetData = () => {
    setData(INITIAL_DATA);
    setCurrentView(View.Dashboard);
  };

  const addTransaction = (t: Transaction) => {
    setData(prev => {
      const updatedAccounts = [...prev.accounts];
      const updatedCards = [...prev.creditCards];
      const updatedWallets = [...prev.wallets];
      
      if (t.type === 'income') {
        const accIdx = updatedAccounts.findIndex(a => a.id === t.sourceId);
        if (accIdx > -1) {
           updatedAccounts[accIdx].balance += t.amount;
        } else {
           const wIdx = updatedWallets.findIndex(w => w.id === t.sourceId);
           if (wIdx > -1) updatedWallets[wIdx].balance += t.amount;
        }
      } else {
        const accIdx = updatedAccounts.findIndex(a => a.id === t.sourceId);
        if (accIdx > -1) {
          updatedAccounts[accIdx].balance -= t.amount;
        } else {
          const cardIdx = updatedCards.findIndex(c => c.id === t.sourceId);
          if (cardIdx > -1) {
            updatedCards[cardIdx].outstanding += t.amount;
          } else {
            const wIdx = updatedWallets.findIndex(w => w.id === t.sourceId);
            if (wIdx > -1) updatedWallets[wIdx].balance -= t.amount;
          }
        }
      }

      return {
        ...prev,
        transactions: [...prev.transactions, t],
        accounts: updatedAccounts,
        creditCards: updatedCards,
        wallets: updatedWallets
      };
    });
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === updatedTx.id ? updatedTx : t)
    }));
  };

  const deleteTransaction = (id: string) => {
    setData(prev => {
      const tx = prev.transactions.find(t => t.id === id);
      if (!tx) return prev;
      const updatedAccounts = [...prev.accounts];
      const updatedCards = [...prev.creditCards];
      const updatedWallets = [...prev.wallets];

      if (tx.type === 'income') {
        const idx = updatedAccounts.findIndex(a => a.id === tx.sourceId);
        if (idx > -1) updatedAccounts[idx].balance -= tx.amount;
        else {
          const wIdx = updatedWallets.findIndex(w => w.id === tx.sourceId);
          if (wIdx > -1) updatedWallets[wIdx].balance -= tx.amount;
        }
      } else {
        const accIdx = updatedAccounts.findIndex(a => a.id === tx.sourceId);
        if (accIdx > -1) {
          updatedAccounts[accIdx].balance += tx.amount;
        } else {
          const cardIdx = updatedCards.findIndex(c => c.id === tx.sourceId);
          if (cardIdx > -1) {
            updatedCards[cardIdx].outstanding -= tx.amount;
          } else {
            const wIdx = updatedWallets.findIndex(w => w.id === tx.sourceId);
            if (wIdx > -1) updatedWallets[wIdx].balance += tx.amount;
          }
        }
      }
      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        accounts: updatedAccounts,
        creditCards: updatedCards,
        wallets: updatedWallets
      };
    });
  };

  const addLoan = (l: Loan) => setData(prev => ({ ...prev, loans: [...prev.loans, l] }));
  const deleteLoan = (id: string) => setData(prev => ({ ...prev, loans: prev.loans.filter(l => l.id !== id) }));
  const updateLoanPaid = (id: string, amount: number) => {
    setData(prev => ({
      ...prev,
      loans: prev.loans.map(l => l.id === id ? { ...l, paidAmount: Math.min(l.principal, l.paidAmount + amount) } : l)
    }));
  };

  const addInvestment = (i: Investment) => setData(prev => ({ ...prev, investments: [...prev.investments, i] }));
  const deleteInvestment = (id: string) => setData(prev => ({ ...prev, investments: prev.investments.filter(i => i.id !== id) }));

  const setBudget = (budget: Budget) => {
    setData(prev => {
      const existingIndex = prev.budgets.findIndex(b => b.category === budget.category && b.subCategory === budget.subCategory);
      if (existingIndex > -1) {
        const updatedBudgets = [...prev.budgets];
        updatedBudgets[existingIndex] = budget;
        return { ...prev, budgets: updatedBudgets };
      }
      return { ...prev, budgets: [...prev.budgets, budget] };
    });
  };

  const addAccount = (acc: BankAccount) => setData(prev => ({ ...prev, accounts: [...prev.accounts, acc] }));
  const addCard = (card: CreditCard) => setData(prev => ({ ...prev, creditCards: [...prev.creditCards, card] }));
  const addWallet = (w: Wallet) => setData(prev => ({ ...prev, wallets: [...prev.wallets, w] }));
  
  const updateAccount = (acc: BankAccount) => setData(prev => ({ ...prev, accounts: prev.accounts.map(a => a.id === acc.id ? acc : a) }));
  const updateCard = (card: CreditCard) => setData(prev => ({ ...prev, creditCards: prev.creditCards.map(c => c.id === card.id ? card : c) }));
  const updateWallet = (w: Wallet) => setData(prev => ({ ...prev, wallets: prev.wallets.map(item => item.id === w.id ? w : item) }));

  const deleteAccount = (id: string) => setData(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
  const deleteCard = (id: string) => setData(prev => ({ ...prev, creditCards: prev.creditCards.filter(c => c.id !== id) }));
  const deleteWallet = (id: string) => setData(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));

  // Metadata Management
  const addCategory = (type: 'income' | 'expense', cat: ExpenseCategory, sub: string) => {
    setData(prev => {
      const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: {
            ...prev.metadata[key],
            [cat]: [...prev.metadata[key][cat], sub]
          }
        }
      };
    });
  };

  const updateCategory = (type: 'income' | 'expense', cat: ExpenseCategory, oldSub: string, newSub: string) => {
    setData(prev => {
      const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: {
            ...prev.metadata[key],
            [cat]: prev.metadata[key][cat].map(s => s === oldSub ? newSub : s)
          }
        },
        transactions: prev.transactions.map(t => 
          (t.type === type && t.category === cat && t.subCategory === oldSub) ? { ...t, subCategory: newSub } : t
        ),
        budgets: type === 'expense' ? prev.budgets.map(b => 
          (b.category === cat && b.subCategory === oldSub) ? { ...b, subCategory: newSub } : b
        ) : prev.budgets
      };
    });
  };

  const deleteCategory = (type: 'income' | 'expense', cat: ExpenseCategory, sub: string) => {
    setData(prev => {
      const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: {
            ...prev.metadata[key],
            [cat]: prev.metadata[key][cat].filter(s => s !== sub)
          }
        }
      };
    });
  };

  const userProfile = data.profile || DEFAULT_PROFILE;

  const renderContent = () => {
    switch (currentView) {
      case View.Dashboard: return <Dashboard data={data} onViewChange={setCurrentView} />;
      case View.Income: return <IncomeTracker transactions={data.transactions} accounts={data.accounts} wallets={data.wallets} categories={data.metadata.incomeCategories} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onAddCategory={(c, s) => addCategory('income', c, s)} onUpdateCategory={(c, o, n) => updateCategory('income', c, o, n)} onDeleteCategory={(c, s) => deleteCategory('income', c, s)} />;
      case View.Expenses: return <ExpenseTracker transactions={data.transactions} accounts={data.accounts} creditCards={data.creditCards} wallets={data.wallets} categories={data.metadata.expenseCategories} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onAddCategory={(c, s) => addCategory('expense', c, s)} onUpdateCategory={(c, o, n) => updateCategory('expense', c, o, n)} onDeleteCategory={(c, s) => deleteCategory('expense', c, s)} />;
      case View.PaymentMethods: return <WalletsManager wallets={data.wallets} onAdd={addWallet} onUpdate={updateWallet} onDelete={deleteWallet} />;
      case View.Budgeting: return <BudgetManager data={data} onSetBudget={setBudget} />;
      case View.Liabilities: return <LiabilitiesManager loans={data.loans} onAdd={addLoan} onDelete={deleteLoan} onUpdatePaid={updateLoanPaid} />;
      case View.Investments: return <InvestmentPortfolio investments={data.investments} onAdd={addInvestment} onDelete={deleteInvestment} />;
      case View.Accounts: return <AccountsManager accounts={data.accounts} creditCards={data.creditCards} bankOptions={data.metadata.bankOptions} cardOptions={data.metadata.cardOptions} onAddAccount={addAccount} onAddCard={addCard} onUpdateAccount={updateAccount} onUpdateCard={updateCard} onDeleteAccount={deleteAccount} onDeleteCard={deleteCard} />;
      case View.Settings: return <SettingsManager data={data} preferences={data.notificationPreferences || DEFAULT_NOTIFICATIONS} onSave={handleUpdateNotifications} onResetData={resetData} />;
      default: return <Dashboard data={data} onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} profile={userProfile} onSave={handleUpdateProfile} />
      <GlobalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} data={data} onViewChange={setCurrentView} />
      
      <main className="flex-1 pb-40 lg:pb-48 p-4 lg:p-12 w-full overflow-hidden">
        <header className="flex flex-col gap-4 mb-6 lg:mb-10 max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <h2 className={`text-xl lg:text-3xl font-black tracking-tight capitalize ${currentView === View.Dashboard ? 'text-blue-600 dark:text-[#39FF14]' : 'text-slate-900 dark:text-white'}`}>
                  {currentView === View.Dashboard ? 'FinTrack' : currentView.replace('-', ' ')}
                </h2>
                <p className="text-slate-400 dark:text-slate-500 font-medium text-xs lg:text-sm mt-0.5">Welcome back, <span className="text-slate-900 dark:text-white font-bold">{userProfile.name.split(' ')[0]}.</span></p>
              </div>
              
              {/* Desktop Global Search Bar */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-200 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all w-64 lg:w-80 group shadow-inner"
              >
                <SearchIcon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold truncate">Search finances...</span>
                <div className="ml-auto flex items-center gap-1 bg-white/10 dark:bg-white/5 px-1.5 py-0.5 rounded-lg border border-white/10">
                  <Command size={10} />
                  <span className="text-[10px] font-black">K</span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                title="Search"
              >
                <SearchIcon size={20} />
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:ring-2 ring-blue-500 dark:ring-[#39FF14] transition-all"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsProfileOpen(true)}>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden group-hover:border-blue-500 dark:group-hover:border-[#39FF14] transition-all ring-2 ring-transparent group-hover:ring-blue-500/20 dark:group-hover:ring-[#39FF14]/20">
                  <img src={userProfile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {activeNotifications.length > 0 && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              {activeNotifications.map(notification => (
                <div key={notification.id} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">{notification.title}</h4>
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400/80">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {notification.loanId && <button onClick={() => setCurrentView(View.Liabilities)} className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 hover:underline">View Loan</button>}
                    <button onClick={() => setActiveNotifications(prev => prev.filter(n => n.id !== notification.id))} className="p-1.5 text-amber-400 hover:text-amber-600 dark:hover:text-amber-200 transition-colors"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </main>

      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default App;
