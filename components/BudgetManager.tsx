
import React, { useState, useMemo } from 'react';
import { FinancialData, Budget, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import { PieChart, Save, Info, AlertTriangle, CheckCircle2, Target, Zap, TrendingUp, ChevronRight, CalendarDays, X, RefreshCw } from 'lucide-react';

interface BudgetManagerProps {
  data: FinancialData;
  onSetBudget: (budget: Budget) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ data, onSetBudget }) => {
  const [activeTab, setActiveTab] = useState<ExpenseCategory>('Personal');
  const [editingBudget, setEditingBudget] = useState<{ subCategory: string, limit: string } | null>(null);

  const currentMonthInfo = useMemo(() => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear(),
      name: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
  }, []);

  const prevMonthInfo = useMemo(() => {
    const d = new Date(currentMonthInfo.year, currentMonthInfo.month - 1, 1);
    return {
      month: d.getMonth(),
      year: d.getFullYear()
    };
  }, [currentMonthInfo]);

  const transactionsByMonth = useMemo(() => {
    return data.transactions.reduce((acc, t) => {
      if (t.type !== 'expense') return acc;
      const parts = t.date.split('-');
      if (parts.length < 2) return acc;
      const key = `${parts[0]}-${parseInt(parts[1]) - 1}`; // Key: YYYY-MM (0-indexed)
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {} as Record<string, typeof data.transactions>);
  }, [data.transactions]);

  const getSpentForMonth = (year: number, month: number, category: ExpenseCategory, subCategory: string) => {
    const key = `${year}-${month}`;
    const txs = transactionsByMonth[key] || [];
    return txs
      .filter(t => t.category === category && t.subCategory === subCategory)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const budgetPerformance = useMemo(() => {
    const subCategories = data.metadata.expenseCategories[activeTab] || [];
    
    return subCategories.map(subCat => {
      const budget = data.budgets.find(b => b.category === activeTab && b.subCategory === subCat);
      const baseLimit = budget ? budget.limit : 0;
      const rolloverEnabled = budget ? budget.rolloverEnabled : false;
      
      const spentCurrent = getSpentForMonth(currentMonthInfo.year, currentMonthInfo.month, activeTab, subCat);
      
      let surplusFromPrev = 0;
      if (rolloverEnabled) {
        const spentPrev = getSpentForMonth(prevMonthInfo.year, prevMonthInfo.month, activeTab, subCat);
        surplusFromPrev = Math.max(0, baseLimit - spentPrev);
      }

      const totalAvailable = baseLimit + surplusFromPrev;
      
      return {
        subCategory: subCat,
        spent: spentCurrent,
        limit: baseLimit,
        rolloverAmount: surplusFromPrev,
        totalAvailable,
        rolloverEnabled,
        budgetObject: budget,
        percentage: totalAvailable > 0 ? (spentCurrent / totalAvailable) * 100 : 0,
        isOver: totalAvailable > 0 && spentCurrent > totalAvailable
      };
    });
  }, [activeTab, transactionsByMonth, data.budgets, data.metadata.expenseCategories, currentMonthInfo, prevMonthInfo]);

  const aggregateStats = useMemo(() => {
    const totalLimit = budgetPerformance.reduce((acc, item) => acc + item.totalAvailable, 0);
    const totalSpent = budgetPerformance.reduce((acc, item) => acc + item.spent, 0);
    const overallPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    const itemsOverBudget = budgetPerformance.filter(i => i.isOver).length;
    
    return { totalLimit, totalSpent, overallPercentage, itemsOverBudget };
  }, [budgetPerformance]);

  const handleSaveBudget = (subCategory: string, limitStr: string) => {
    const limit = parseFloat(limitStr);
    if (isNaN(limit)) return;
    
    const existing = data.budgets.find(b => b.category === activeTab && b.subCategory === subCategory);
    
    onSetBudget({
      id: existing?.id || Math.random().toString(36).substr(2, 9),
      category: activeTab,
      subCategory,
      limit,
      rolloverEnabled: existing?.rolloverEnabled || false
    });
    setEditingBudget(null);
  };

  const toggleRollover = (item: any) => {
    onSetBudget({
      id: item.budgetObject?.id || Math.random().toString(36).substr(2, 9),
      category: activeTab,
      subCategory: item.subCategory,
      limit: item.limit,
      rolloverEnabled: !item.rolloverEnabled
    });
  };

  const getStatusColor = (percent: number, isOver: boolean) => {
    if (isOver) return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30';
    if (percent > 85) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30';
    return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30';
  };

  const getBarColor = (percent: number, isOver: boolean) => {
    if (isOver) return 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
    if (percent > 85) return 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
    return 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded-[1.5rem] w-full max-w-md shadow-inner">
          {(['Personal', 'Business'] as ExpenseCategory[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-[#39FF14] shadow-md' : 'text-slate-500 dark:text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
          <CalendarDays size={20} className="text-blue-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{currentMonthInfo.name}</span>
        </div>
      </div>

      <div className="bg-slate-950 dark:bg-slate-900 p-8 lg:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Target size={180} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
               <Zap size={14} className="text-[#39FF14]" /> {activeTab} Spending Efficiency
            </p>
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">
                {formatCurrency(aggregateStats.totalSpent)}
                <span className="text-xl lg:text-3xl text-slate-500 ml-2">/ {formatCurrency(aggregateStats.totalLimit)}</span>
              </h2>
              <div className="flex items-center gap-4">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${aggregateStats.itemsOverBudget > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-[#39FF14]/20 text-[#39FF14]'}`}>
                    {aggregateStats.itemsOverBudget} {aggregateStats.itemsOverBudget === 1 ? 'Alert' : 'Alerts'} Active
                 </div>
                 <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    {aggregateStats.overallPercentage.toFixed(1)}% Consumed
                 </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span>Pacing Indicator</span>
               <span className={aggregateStats.overallPercentage > 100 ? 'text-rose-400' : 'text-[#39FF14]'}>
                  {aggregateStats.totalLimit > 0 ? (aggregateStats.totalLimit > aggregateStats.totalSpent ? `${formatCurrency(aggregateStats.totalLimit - aggregateStats.totalSpent)} Left` : `${formatCurrency(aggregateStats.totalSpent - aggregateStats.totalLimit)} Excess`) : 'Configure Targets'}
               </span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
               <div 
                 className={`h-full rounded-full transition-all duration-1000 ${aggregateStats.overallPercentage > 100 ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.4)]'}`}
                 style={{ width: `${Math.min(100, aggregateStats.overallPercentage)}%` }}
               />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgetPerformance.map((item) => {
          const isEditingThis = editingBudget?.subCategory === item.subCategory;
          const currentBaseLimit = isEditingThis ? parseFloat(editingBudget.limit) || 0 : item.limit;
          const currentTotalAvailable = currentBaseLimit + item.rolloverAmount;
          const currentPercentage = currentTotalAvailable > 0 ? (item.spent / currentTotalAvailable) * 100 : 0;
          const currentIsOver = currentTotalAvailable > 0 && item.spent > currentTotalAvailable;
          
          const status = getStatusColor(currentPercentage, currentIsOver);
          const barStyle = getBarColor(currentPercentage, currentIsOver);
          
          return (
            <div key={item.subCategory} className={`bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2.5rem] border ${isEditingThis ? 'border-blue-500 shadow-2xl scale-[1.01]' : 'border-slate-100 dark:border-slate-800 shadow-sm'} hover:shadow-xl transition-all group flex flex-col min-h-[350px]`}>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4 min-w-0">
                   <div className={`w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-all shrink-0`}>
                      <PieChart size={24} />
                   </div>
                   <div className="min-w-0">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter truncate">{item.subCategory}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-colors ${status}`}>
                        {currentIsOver ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                        {currentIsOver ? 'Cap Exceeded' : currentTotalAvailable > 0 ? 'Pacing Well' : 'Unlimited'}
                      </div>
                      <button 
                        onClick={() => toggleRollover(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${item.rolloverEnabled ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}
                        title="Enable Rollover from previous month"
                      >
                        <RefreshCw size={10} className={item.rolloverEnabled ? 'animate-spin-slow' : ''} />
                        Rollover {item.rolloverEnabled ? 'On' : 'Off'}
                      </button>
                    </div>
                   </div>
                </div>
                
                <div className="text-right shrink-0">
                  {isEditingThis ? (
                    <div className="flex flex-col items-end gap-2 animate-in fade-in duration-200">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Base Target</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingBudget.limit}
                          onChange={(e) => setEditingBudget({ ...editingBudget, limit: e.target.value })}
                          className="w-24 bg-slate-100 dark:bg-slate-800 border-2 border-blue-500/50 rounded-xl px-3 py-2 text-sm font-black dark:text-white outline-none focus:ring-0 shadow-inner"
                          autoFocus
                          placeholder="0.00"
                        />
                        <button
                          onClick={() => handleSaveBudget(item.subCategory, editingBudget.limit)}
                          className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-90"
                        >
                          <Save size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingBudget({ subCategory: item.subCategory, limit: item.limit.toString() })}
                      className="group/btn flex flex-col items-end"
                    >
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Target</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover/btn:underline transition-all">
                        {item.limit > 0 ? formatCurrency(item.limit) : 'Set Cap'}
                        <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">MTD Spent</p>
                    <p className={`text-2xl font-black transition-colors ${currentIsOver ? 'text-rose-500' : 'text-slate-900 dark:text-white'} leading-none`}>
                      {formatCurrency(item.spent)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Available Supply</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                      {formatCurrency(currentTotalAvailable)}
                    </p>
                    {item.rolloverEnabled && item.rolloverAmount > 0 && (
                      <p className="text-[8px] font-black text-emerald-500 uppercase">Includes {formatCurrency(item.rolloverAmount)} Surplus</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className={currentIsOver ? 'text-rose-500' : ''}>{currentPercentage.toFixed(1)}% Consumed</span>
                      <span className="flex items-center gap-1">
                         {item.rolloverEnabled && <RefreshCw size={8} className="text-blue-500" />} 
                         Bal: {formatCurrency(Math.max(0, currentTotalAvailable - item.spent))}
                      </span>
                   </div>
                   <div className="relative h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden border border-transparent dark:border-white/5 shadow-inner">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${barStyle}`}
                      style={{ width: `${Math.min(100, currentPercentage)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center gap-6">
         <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
            <RefreshCw size={32} />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Smart Rollover Intelligence</h4>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
               Rollover allows you to transfer your discipline from last month to this month. When enabled, your surplus funds from the previous month are automatically added to your current month's spending power.
            </p>
         </div>
      </div>
    </div>
  );
};

export default BudgetManager;
