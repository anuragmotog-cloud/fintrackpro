
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Landmark, CreditCard, Banknote, TrendingUp, Briefcase, ChevronRight, Filter, Calendar, DollarSign, Tag, Clock } from 'lucide-react';
import { FinancialData, View, Transaction, BankAccount, CreditCard as CardType, Wallet, Loan, Investment } from '../types';
import { formatCurrency } from '../utils/calculations';
import { getCategoryIcon } from '../constants';

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  data: FinancialData;
  onViewChange: (view: View) => void;
}

type FilterType = 'all' | 'transactions' | 'accounts' | 'investments' | 'liabilities';

const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({ isOpen, onClose, data, onViewChange }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Advanced filters state
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim() && !minAmount && !maxAmount && !startDate) return null;

    const q = query.toLowerCase();
    const min = parseFloat(minAmount) || 0;
    const max = parseFloat(maxAmount) || Infinity;

    const filteredTransactions = data.transactions.filter(t => {
      const matchQuery = !q || t.description.toLowerCase().includes(q) || t.subCategory.toLowerCase().includes(q);
      const matchAmount = t.amount >= min && t.amount <= max;
      const matchDate = !startDate || t.date >= startDate;
      return matchQuery && matchAmount && matchDate;
    });

    const filteredAccounts = [
      ...data.accounts,
      ...data.creditCards,
      ...data.wallets
    ].filter(a => {
      const name = a.nickname || a.name;
      const matchQuery = !q || name.toLowerCase().includes(q);
      const bal = 'balance' in a ? a.balance : 'outstanding' in a ? a.outstanding : 0;
      const matchAmount = bal >= min && bal <= max;
      return matchQuery && matchAmount;
    });

    const filteredLoans = data.loans.filter(l => {
      const matchQuery = !q || l.name.toLowerCase().includes(q);
      const matchAmount = l.principal >= min && l.principal <= max;
      return matchQuery && matchAmount;
    });

    const filteredInvestments = data.investments.filter(i => {
      const matchQuery = !q || i.name.toLowerCase().includes(q);
      const val = i.currentPrice * i.quantity;
      const matchAmount = val >= min && val <= max;
      return matchQuery && matchAmount;
    });

    return {
      transactions: filteredTransactions,
      accounts: filteredAccounts,
      liabilities: filteredLoans,
      investments: filteredInvestments
    };
  }, [query, data, minAmount, maxAmount, startDate]);

  if (!isOpen) return null;

  const navigateTo = (view: View) => {
    onViewChange(view);
    onClose();
  };

  const hasAnyResults = results && (
    results.transactions.length > 0 ||
    results.accounts.length > 0 ||
    results.liabilities.length > 0 ||
    results.investments.length > 0
  );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col p-4 md:p-12 lg:p-24 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl mx-auto flex flex-col h-full animate-in zoom-in-95 duration-300">
        {/* Search Header */}
        <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-transparent focus-within:border-blue-500/50 dark:focus-within:border-[#39FF14]/50 transition-all shadow-inner">
            <Search className="text-slate-400" size={24} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search transactions, accounts, assets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-blue-600 dark:bg-[#39FF14] text-white dark:text-slate-950 shadow-lg' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Filter size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block flex items-center gap-2">
                  <DollarSign size={12} /> Min Amount (₹)
                </label>
                <input 
                  type="number" 
                  value={minAmount} 
                  onChange={e => setMinAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-2.5 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block flex items-center gap-2">
                  <DollarSign size={12} /> Max Amount (₹)
                </label>
                <input 
                  type="number" 
                  value={maxAmount} 
                  onChange={e => setMaxAmount(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-2.5 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block flex items-center gap-2">
                  <Calendar size={12} /> Since Date
                </label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-2.5 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Type Filter Chips */}
          <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
            {(['all', 'transactions', 'accounts', 'investments', 'liabilities'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-b-[2.5rem] overflow-y-auto no-scrollbar p-6 lg:p-8 space-y-10 shadow-inner">
          {!results ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
              <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse">
                <Search size={64} />
              </div>
              <p className="font-black uppercase tracking-widest">Start typing to search your finances</p>
            </div>
          ) : !hasAnyResults ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-4">
               <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X size={48} />
              </div>
              <p className="font-black uppercase tracking-widest">No matching records found</p>
              <p className="text-xs font-medium">Try adjusting your keywords or filters</p>
            </div>
          ) : (
            <>
              {/* Transactions Section */}
              {(activeFilter === 'all' || activeFilter === 'transactions') && results.transactions.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <Banknote className="text-emerald-500" size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transactions ({results.transactions.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {results.transactions.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => navigateTo(t.type === 'income' ? View.Income : View.Expenses)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                            {getCategoryIcon(t.subCategory)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold dark:text-white truncate max-w-[150px] md:max-w-xs">{t.description || t.subCategory}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              <Calendar size={10} /> {t.date}
                              <Tag size={10} className="ml-1" /> {t.subCategory}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                            {t.type === 'income' ? '+' : ''}{formatCurrency(t.amount)}
                          </span>
                          <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Accounts/Wallets Section */}
              {(activeFilter === 'all' || activeFilter === 'accounts') && results.accounts.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <Landmark className="text-blue-500" size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Accounts & Cards ({results.accounts.length})</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.accounts.map(a => (
                      <button 
                        key={a.id} 
                        onClick={() => navigateTo('balance' in a ? View.Accounts : 'provider' in a ? View.PaymentMethods : View.Accounts)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
                            {'limit' in a ? <CreditCard size={20} /> : <Landmark size={20} />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold dark:text-white truncate">{a.nickname || a.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{a.name}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                          {formatCurrency('balance' in a ? a.balance : 'outstanding' in a ? a.outstanding : 0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Assets Section */}
              {(activeFilter === 'all' || activeFilter === 'investments') && results.investments.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <TrendingUp className="text-amber-500" size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Investment Assets ({results.investments.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {results.investments.map(i => (
                      <button 
                        key={i.id} 
                        onClick={() => navigateTo(View.Investments)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center font-black">
                            {i.name[0]}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold dark:text-white">{i.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{i.quantity} Units</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(i.currentPrice * i.quantity)}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Debt Section */}
              {(activeFilter === 'all' || activeFilter === 'liabilities') && results.liabilities.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <Briefcase className="text-rose-500" size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Debts & Loans ({results.liabilities.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {results.liabilities.map(l => (
                      <button 
                        key={l.id} 
                        onClick={() => navigateTo(View.Liabilities)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center justify-center">
                            <Clock size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold dark:text-white">{l.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">EMI: {formatCurrency(l.principal / l.tenure)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-rose-500">{formatCurrency(l.principal - l.paidAmount)}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Info */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-8 py-4 rounded-b-[2.5rem] flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 dark:border-slate-700">
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">esc</kbd> to close</span>
              <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">tab</kbd> to cycle filters</span>
           </div>
           <p>Global Search V1.0</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchOverlay;
