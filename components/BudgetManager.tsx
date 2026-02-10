
import React, { useState, useMemo } from 'react';
import { FinancialData, Budget, ExpenseCategory } from '../types';
import { EXPENSE_SUB_CATEGORIES } from '../constants';
import { formatCurrency } from '../utils/calculations';
import { PieChart, Save, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetManagerProps {
  data: FinancialData;
  onSetBudget: (budget: Budget) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ data, onSetBudget }) => {
  const [activeTab, setActiveTab] = useState<ExpenseCategory>('Personal');
  const [editingBudget, setEditingBudget] = useState<{ subCategory: string, limit: string } | null>(null);

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return data.transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [data.transactions]);

  const budgetPerformance = useMemo(() => {
    const subCategories = EXPENSE_SUB_CATEGORIES[activeTab];
    return subCategories.map(subCat => {
      const spent = currentMonthTransactions
        .filter(t => t.category === activeTab && t.subCategory === subCat)
        .reduce((acc, t) => acc + t.amount, 0);
      
      const budget = data.budgets.find(b => b.category === activeTab && b.subCategory === subCat);
      const limit = budget ? budget.limit : 0;
      
      return {
        subCategory: subCat,
        spent,
        limit,
        percentage: limit > 0 ? (spent / limit) * 100 : 0,
        isOver: limit > 0 && spent > limit
      };
    });
  }, [activeTab, currentMonthTransactions, data.budgets]);

  const handleSaveBudget = (subCategory: string, limitStr: string) => {
    const limit = parseFloat(limitStr);
    if (isNaN(limit)) return;
    
    onSetBudget({
      id: Math.random().toString(36).substr(2, 9),
      category: activeTab,
      subCategory,
      limit
    });
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('Personal')}
          className={`px-6 lg:px-8 py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all ${
            activeTab === 'Personal' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveTab('Business')}
          className={`px-6 lg:px-8 py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all ${
            activeTab === 'Business' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Business
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {budgetPerformance.map((item) => (
          <div key={item.subCategory} className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{item.subCategory}</h3>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Limit</p>
              </div>
              
              {editingBudget?.subCategory === item.subCategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editingBudget.limit}
                    onChange={(e) => setEditingBudget({ ...editingBudget, limit: e.target.value })}
                    className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm focus:ring-2 ring-blue-500 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveBudget(item.subCategory, editingBudget.limit)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingBudget({ subCategory: item.subCategory, limit: item.limit.toString() })}
                  className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline"
                >
                  {item.limit > 0 ? formatCurrency(item.limit) : 'Set Limit'}
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5">Spent</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(item.spent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5">Remaining</p>
                  <p className={`text-sm font-bold ${item.isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {item.limit > 0 ? formatCurrency(Math.max(0, item.limit - item.spent)) : '--'}
                  </p>
                </div>
              </div>

              <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    item.isOver ? 'bg-rose-500' : item.percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                ></div>
              </div>

              <div className="flex items-center gap-2">
                {item.isOver ? (
                  <>
                    <AlertTriangle size={14} className="text-rose-500" />
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Over Budget by {formatCurrency(item.spent - item.limit)}</span>
                  </>
                ) : item.limit > 0 ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Within Budget ({item.percentage.toFixed(0)}%)</span>
                  </>
                ) : (
                  <>
                    <Info size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No budget limit set for this category</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetManager;
