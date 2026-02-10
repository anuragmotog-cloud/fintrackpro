import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { FinancialData, View } from '../types';
import { formatCurrency, getInvestmentSummary, getLoanSummary, getExpenseSummary, getIncomeSummary } from '../utils/calculations';
import { ArrowUpRight, ArrowDownRight, Briefcase, CreditCard, TrendingUp, Banknote, PieChart as PieIcon, BarChart3, AlertTriangle, CheckCircle2, Landmark, Wallet, ChevronRight } from 'lucide-react';

interface DashboardProps {
  data: FinancialData;
  onViewChange: (view: View) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

type PieTimeframe = 'today' | 'week' | 'month' | 'quarter' | 'year';
type BarTimeframe = '7d' | '30d' | 3 | 6 | 12;

const Dashboard: React.FC<DashboardProps> = ({ data, onViewChange }) => {
  const [pieTimeframe, setPieTimeframe] = useState<PieTimeframe>('month');
  const [barTimeframe, setBarTimeframe] = useState<BarTimeframe>(3);

  const invSummary = getInvestmentSummary(data.investments);
  const loanSummary = getLoanSummary(data.loans);
  const expSummary = getExpenseSummary(data.transactions);
  const incSummary = getIncomeSummary(data.transactions);

  const totalCapital = incSummary.total + invSummary.totalValue - loanSummary.totalOutstanding;
  const netFlow = incSummary.total - expSummary.total;

  const pieChartData = useMemo(() => {
    const now = new Date();
    const filtered = data.transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      if (pieTimeframe === 'today') return d >= startOfToday && d <= endOfToday;
      if (pieTimeframe === 'week') return d >= startOfWeek && d <= endOfToday;
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentQuarter = Math.floor(currentMonth / 3);
      const yearMatch = d.getFullYear() === currentYear;
      if (pieTimeframe === 'month') return yearMatch && d.getMonth() === currentMonth;
      if (pieTimeframe === 'quarter') return yearMatch && Math.floor(d.getMonth() / 3) === currentQuarter;
      return yearMatch;
    });
    const subcatMap: Record<string, number> = {};
    filtered.forEach(t => {
      subcatMap[t.subCategory] = (subcatMap[t.subCategory] || 0) + t.amount;
    });
    const totalAmount = filtered.reduce((acc, t) => acc + t.amount, 0);
    return Object.entries(subcatMap)
      .map(([name, value]) => ({ 
        name, 
        value,
        percent: totalAmount > 0 ? (value / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [data.transactions, pieTimeframe]);

  const barChartData = useMemo(() => {
    const now = new Date();
    const trendData = [];
    if (typeof barTimeframe === 'string') {
      const days = barTimeframe === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayTxs = data.transactions.filter(t => t.date === dateStr);
        const income = dayTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        trendData.push({ 
          name: d.toLocaleDateString('default', { day: '2-digit', month: 'short' }),
          Income: income,
          Expense: expense,
          Net: income - expense
        });
      }
    } else {
      for (let i = barTimeframe - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const monthTxs = data.transactions.filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === m && td.getFullYear() === y;
        });
        const income = monthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        trendData.push({ 
          name: d.toLocaleString('default', { month: 'short' }),
          Income: income,
          Expense: expense,
          Net: income - expense
        });
      }
    }
    return trendData;
  }, [data.transactions, barTimeframe]);

  const budgetHealth = useMemo(() => {
    if (!data.budgets.length) return null;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentExpenses = data.transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    let overBudgetCount = 0;
    let totalBudgeted = 0;
    let totalSpentInBudgeted = 0;
    data.budgets.forEach(budget => {
      const spent = currentExpenses
        .filter(t => t.category === budget.category && t.subCategory === budget.subCategory)
        .reduce((acc, t) => acc + t.amount, 0);
      totalBudgeted += budget.limit;
      totalSpentInBudgeted += spent;
      if (spent > budget.limit) overBudgetCount++;
    });
    return { overBudgetCount, totalBudgeted, totalSpentInBudgeted, percentage: totalBudgeted > 0 ? (totalSpentInBudgeted / totalBudgeted) * 100 : 0 };
  }, [data.transactions, data.budgets]);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, percent } = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-black text-white mb-1 uppercase tracking-wider">{name}</p>
          <p className="text-blue-400 font-bold mb-0.5">{formatCurrency(value)}</p>
          <p className="text-slate-400 font-medium">{percent.toFixed(1)}% of total spend</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const inc = payload.find((p: any) => p.dataKey === 'Income')?.value || 0;
      const exp = payload.find((p: any) => p.dataKey === 'Expense')?.value || 0;
      const net = inc - exp;
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-xl text-xs space-y-2">
          <p className="font-black text-white uppercase tracking-wider border-b border-slate-700 pb-1 mb-1">{label}</p>
          <div className="flex justify-between gap-8">
            <span className="text-slate-400">Income</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(inc)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-slate-400">Expense</span>
            <span className="text-blue-400 font-bold">{formatCurrency(exp)}</span>
          </div>
          <div className="flex justify-between gap-8 pt-1 border-t border-slate-700">
            <span className="text-slate-400">Savings</span>
            <span className={`font-black ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatCurrency(net)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 col-span-1 md:col-span-2 flex flex-col justify-center">
          <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm font-medium mb-1 uppercase tracking-wider">Estimated Net Liquidity</p>
          <div className="flex flex-wrap items-end gap-2 lg:gap-3">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">{formatCurrency(totalCapital)}</h2>
            <div className={`flex items-center text-xs lg:text-sm font-bold mb-1 lg:mb-2 ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {netFlow >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{formatCurrency(Math.abs(netFlow))} this month</span>
            </div>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-sm mt-4 font-medium italic">Cash Flow + Assets - Liabilities</p>
        </div>

        <div className="bg-emerald-600 dark:bg-emerald-700 p-6 rounded-3xl shadow-xl shadow-emerald-500/20 text-white flex flex-col justify-between transition-transform hover:scale-[1.01]">
          <div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4">
              <Banknote size={20} />
            </div>
            <p className="text-emerald-50 text-xs lg:text-sm font-medium">Total Inflow Logged</p>
            <h3 className="text-xl lg:text-2xl font-black mt-1 leading-tight">{formatCurrency(incSummary.total)}</h3>
          </div>
          <p className="text-[10px] lg:text-sm font-medium mt-4 text-emerald-50 opacity-80">Tracked Daily</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard title="Income" value={formatCurrency(incSummary.total)} icon={<Banknote size={18} className="text-emerald-500" />} onClick={() => onViewChange(View.Income)} />
        <StatCard title="Spend" value={formatCurrency(expSummary.total)} icon={<CreditCard size={18} className="text-rose-500" />} onClick={() => onViewChange(View.Expenses)} />
        <StatCard title="Debt" value={formatCurrency(loanSummary.totalOutstanding)} icon={<Briefcase size={18} className="text-blue-500" />} onClick={() => onViewChange(View.Liabilities)} />
        <StatCard title="Portfolio" value={formatCurrency(invSummary.totalValue)} icon={<TrendingUp size={18} className="text-amber-500" />} onClick={() => onViewChange(View.Investments)} />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet size={20} className="text-blue-500" /> Account Overview
          </h3>
          <button onClick={() => onViewChange(View.Accounts)} className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-1 hover:underline">
            Manage Accounts <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Bank Accounts</p>
            <div className="space-y-4">
              {data.accounts.length > 0 ? data.accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Landmark size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{acc.nickname || acc.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-medium">{acc.name}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(acc.balance)}</p>
                </div>
              )) : <p className="text-xs text-slate-400 italic">No bank accounts added.</p>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Active Credit Cards</p>
            <div className="space-y-4">
              {data.creditCards.length > 0 ? data.creditCards.map(card => {
                const utilization = (card.outstanding / card.limit) * 100;
                return (
                  <div key={card.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                          <CreditCard size={16} />
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{card.nickname || card.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(card.outstanding)}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Limit: {formatCurrency(card.limit)}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${utilization > 75 ? 'bg-rose-500' : utilization > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, utilization)}%` }}></div>
                    </div>
                  </div>
                );
              }) : <p className="text-xs text-slate-400 italic">No credit cards added.</p>}
            </div>
          </div>
        </div>
      </div>

      {budgetHealth && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-6">
          <div className="shrink-0">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${budgetHealth.overBudgetCount > 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
              {budgetHealth.overBudgetCount > 0 ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
            </div>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{budgetHealth.overBudgetCount > 0 ? `${budgetHealth.overBudgetCount} Categories Over Budget` : 'Budget is Healthy'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">You've spent {formatCurrency(budgetHealth.totalSpentInBudgeted)} out of your {formatCurrency(budgetHealth.totalBudgeted)} allocated budget.</p>
          </div>
          <div className="w-full lg:w-48">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Total Utilization</span>
              <span className={`text-[10px] font-black ${budgetHealth.percentage > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>{budgetHealth.percentage.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${budgetHealth.percentage > 100 ? 'bg-rose-500' : budgetHealth.percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, budgetHealth.percentage)}%` }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
             <h3 className="text-sm lg:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <PieIcon size={18} className="text-blue-500" /> Expense Mix
             </h3>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
               {(['today', 'week', 'month', 'quarter', 'year'] as PieTimeframe[]).map((tf) => (
                 <button key={tf} onClick={() => setPieTimeframe(tf)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${pieTimeframe === tf ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>{tf === 'week' ? '7 Days' : tf === 'today' ? 'Today' : tf}</button>
               ))}
             </div>
          </div>
          <div className="h-64 relative">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value" animationDuration={1000}>
                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2"><PieIcon size={32} className="opacity-20" /><p className="italic">No data for this timeframe</p></div>}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-sm lg:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-500" /> Cash Flow Trend
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
               {( ['7d', '30d', 3, 6, 12] as BarTimeframe[]).map((tf) => (
                 <button key={tf.toString()} onClick={() => setBarTimeframe(tf)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${barTimeframe === tf ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>{tf === '7d' ? '7D' : tf === '30d' ? '1M' : `${tf}M`}</button>
               ))}
             </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.5 }} content={<CustomBarTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Bar name="Inflow" dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Outflow" dataKey="Expense" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, onClick }: { title: string; value: string; icon: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="w-full text-left bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3 lg:gap-4 transition-all hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md cursor-pointer group">
    <div className="w-8 h-8 lg:w-12 lg:h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">{icon}</div>
    <div className="min-w-0"><p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-xs font-semibold uppercase tracking-wider truncate">{title}</p><h4 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white truncate">{value}</h4></div>
  </button>
);

export default Dashboard;