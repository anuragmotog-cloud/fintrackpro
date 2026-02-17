
import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { FinancialData, View, Budget } from '../types';
import { formatCurrency, getInvestmentSummary, getLoanSummary, getExpenseSummary, getIncomeSummary } from '../utils/calculations';
import { ArrowUpRight, ArrowDownRight, Briefcase, CreditCard, TrendingUp, Banknote, PieChart as PieIcon, BarChart3, Landmark, ChevronRight, SmartphoneNfc, QrCode, Sparkles, AlertCircle, Target, Wallet } from 'lucide-react';
import { FinancialInsight, getFinancialInsights } from '../services/geminiService';
import AIInsights from './AIInsights';

interface DashboardProps {
  data: FinancialData;
  onViewChange: (view: View) => void;
}

const COLORS = ['#39FF14', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

type PieTimeframe = 'today' | 'week' | 'month' | 'quarter' | 'year';
type BarTimeframe = '7d' | '30d' | 3 | 6 | 12;

const Dashboard: React.FC<DashboardProps> = ({ data, onViewChange }) => {
  const [pieTimeframe, setPieTimeframe] = useState<PieTimeframe>('month');
  const [barTimeframe, setBarTimeframe] = useState<BarTimeframe>(3);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      if (data.transactions.length > 5) {
        setLoadingInsights(true);
        const res = await getFinancialInsights(data);
        setInsights(res);
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [data.transactions.length]);

  const invSummary = getInvestmentSummary(data.investments);
  const loanSummary = getLoanSummary(data.loans);
  const expSummary = getExpenseSummary(data.transactions);
  const incSummary = getIncomeSummary(data.transactions);

  const totalAccountBalances = useMemo(() => data.accounts.reduce((acc, a) => acc + a.balance, 0), [data.accounts]);
  const totalWalletBalances = useMemo(() => data.wallets.reduce((acc, w) => acc + w.balance, 0), [data.wallets]);
  const totalCardOutstanding = useMemo(() => data.creditCards.reduce((acc, c) => acc + c.outstanding, 0), [data.creditCards]);
  
  const totalCapital = totalAccountBalances + totalWalletBalances + invSummary.totalValue - loanSummary.totalOutstanding - totalCardOutstanding;
  const netFlow = incSummary.total - expSummary.total;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const budgetSummary = useMemo(() => {
    return data.budgets.map(budget => {
      const spent = data.transactions
        .filter(t => t.type === 'expense' && t.category === budget.category && t.subCategory === budget.subCategory)
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);
      
      return {
        ...budget,
        spent,
        percentage: budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      };
    }).sort((a, b) => b.percentage - a.percentage).slice(0, 4);
  }, [data.budgets, data.transactions, currentMonth, currentYear]);

  const allAccounts = useMemo(() => {
    const combined = [
      ...data.accounts.map(a => ({ ...a, icon: <Landmark size={18} />, typeLabel: 'BANK' })),
      ...data.wallets.map(w => ({ ...w, icon: <SmartphoneNfc size={18} />, typeLabel: 'WALLET', balance: w.balance })),
      ...data.creditCards.map(c => ({ ...c, icon: <CreditCard size={18} />, typeLabel: 'CARD', balance: -c.outstanding }))
    ];
    // Sort by absolute balance magnitude so most significant accounts show first
    return combined.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).slice(0, 6);
  }, [data.accounts, data.wallets, data.creditCards]);

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

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, percent } = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-black text-white mb-1 uppercase tracking-wider">{name}</p>
          <p className="text-[#39FF14] font-bold mb-0.5">{formatCurrency(value)}</p>
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
          <p className="font-black text-white uppercase tracking-wider border-b border-white/10 pb-1 mb-1">{label}</p>
          <div className="flex justify-between gap-8">
            <span className="text-slate-400">Income</span>
            <span className="text-[#39FF14] font-bold">{formatCurrency(inc)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-slate-400">Expense</span>
            <span className="text-blue-400 font-bold">{formatCurrency(exp)}</span>
          </div>
          <div className="flex justify-between gap-8 pt-1 border-t border-white/10">
            <span className="text-slate-400">Savings</span>
            <span className={`font-black ${net >= 0 ? 'text-[#39FF14]' : 'text-rose-500'}`}>
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
      {/* AI Intelligence Header */}
      <AIInsights insights={insights} loading={loadingInsights} />

      {/* Top Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-slate-950 dark:bg-slate-900 p-8 lg:p-12 rounded-[3rem] shadow-2xl border border-white/5 col-span-1 md:col-span-2 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <TrendingUp size={180} />
          </div>
          <p className="text-slate-500 dark:text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <Sparkles size={14} className="text-[#39FF14]" /> Combined Net Liquidity
          </p>
          <div className="flex flex-wrap items-baseline gap-4 lg:gap-6 relative z-10">
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
              {formatCurrency(totalCapital)}
            </h2>
            <div className={`flex items-center text-xs lg:text-sm font-black px-4 py-2 rounded-2xl ${netFlow >= 0 ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-rose-500/10 text-rose-500'}`}>
              {netFlow >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              <span>{formatCurrency(Math.abs(netFlow))} this month</span>
            </div>
          </div>
          <p className="text-slate-500 text-[9px] lg:text-xs mt-8 font-bold uppercase tracking-[0.2em] opacity-40">Assets + Cash + Investments - Total Liabilities</p>
        </div>

        <div className="bg-[#39FF14] p-8 lg:p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(57,255,20,0.3)] text-slate-950 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer" onClick={() => onViewChange(View.Income)}>
          <div>
            <div className="w-14 h-14 bg-slate-950/10 rounded-2xl flex items-center justify-center mb-6">
              <Banknote size={28} strokeWidth={3} />
            </div>
            <p className="text-slate-950/50 text-[10px] font-black uppercase tracking-[0.3em]">Monthly Inflow</p>
            <h3 className="text-4xl lg:text-5xl font-black mt-1 leading-tight tracking-tighter">{formatCurrency(incSummary.total)}</h3>
          </div>
          <div className="flex justify-between items-center mt-8">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Across all contexts</p>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="Income" value={formatCurrency(incSummary.total)} icon={<Banknote size={20} className="text-[#39FF14]" />} onClick={() => onViewChange(View.Income)} />
        <StatCard title="Spend" value={formatCurrency(expSummary.total)} icon={<CreditCard size={20} className="text-rose-500" />} onClick={() => onViewChange(View.Expenses)} />
        <StatCard title="Debt" value={formatCurrency(loanSummary.totalOutstanding + totalCardOutstanding)} icon={<Briefcase size={20} className="text-blue-500" />} onClick={() => onViewChange(View.Liabilities)} />
        <StatCard title="Portfolio" value={formatCurrency(invSummary.totalValue)} icon={<TrendingUp size={20} className="text-amber-500" />} onClick={() => onViewChange(View.Investments)} />
      </div>

      {/* Account & Budget Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Account Overview Section (Updated) */}
        <div className="bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm lg:text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
               <Landmark size={20} className="text-blue-500" /> Account Overview
             </h3>
             <button onClick={() => onViewChange(View.Accounts)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Manage All</button>
           </div>
           
           <div className="space-y-3">
             {allAccounts.length === 0 ? (
               <div className="py-10 text-center text-slate-400 text-xs font-black uppercase tracking-widest opacity-40">No accounts linked</div>
             ) : (
               allAccounts.map((acc, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group border border-transparent dark:border-white/5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
                         {acc.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{acc.nickname || acc.name}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{(acc as any).typeLabel || 'ENTRY'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                       <p className={`text-sm font-black ${acc.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                         {formatCurrency(acc.balance)}
                       </p>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* Budgets Overview */}
        <div className="bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm lg:text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
               <Target size={20} className="text-amber-500" /> Monthly Budgets
             </h3>
             <button onClick={() => onViewChange(View.Budgeting)} className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:underline">View Details</button>
          </div>

          <div className="space-y-6">
            {budgetSummary.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-black uppercase tracking-widest opacity-40">No budgets defined</div>
            ) : (
              budgetSummary.map((b, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{b.subCategory}</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(b.spent)} <span className="text-[10px] text-slate-400 font-bold opacity-60">/ {formatCurrency(b.limit)}</span></p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${b.percentage > 100 ? 'bg-rose-500/10 text-rose-500' : b.percentage > 85 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                       {b.percentage > 100 && <AlertCircle size={10} />}
                       {b.percentage.toFixed(0)}%
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${b.percentage > 100 ? 'bg-rose-500' : b.percentage > 85 ? 'bg-amber-500' : 'bg-[#39FF14]'}`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
             <h3 className="text-sm lg:text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
               <PieIcon size={20} className="text-blue-500" /> Expense Breakdown
             </h3>
             <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
               {(['today', 'week', 'month', 'quarter', 'year'] as PieTimeframe[]).map((tf) => (
                 <button key={tf} onClick={() => setPieTimeframe(tf)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${pieTimeframe === tf ? 'bg-white dark:bg-slate-700 text-[#39FF14] shadow-lg' : 'text-slate-500 dark:text-slate-500 hover:text-white'}`}>{tf === 'week' ? '7D' : tf === 'today' ? '1D' : tf.substring(0, 1).toUpperCase() + tf.substring(1, 2)}</button>
               ))}
             </div>
          </div>
          <div className="h-72 relative">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" animationDuration={1000}>
                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '30px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2 opacity-30 font-black uppercase tracking-widest"><PieIcon size={48} /><p>No data found</p></div>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <h3 className="text-sm lg:text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-[#39FF14]" /> Growth Trends
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
               {( ['7d', '30d', 3, 6, 12] as BarTimeframe[]).map((tf) => (
                 <button key={tf.toString()} onClick={() => setBarTimeframe(tf)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${barTimeframe === tf ? 'bg-white dark:bg-slate-700 text-[#39FF14] shadow-lg' : 'text-slate-500 dark:text-slate-500 hover:text-white'}`}>{tf === '7d' ? '7D' : tf === '30d' ? '1M' : `${tf}M`}</button>
               ))}
             </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{ fill: '#ffffff05' }} content={<CustomBarTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '30px' }} />
                <Bar name="Inflow" dataKey="Income" fill="#39FF14" radius={[6, 6, 0, 0]} />
                <Bar name="Outflow" dataKey="Expense" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, onClick }: { title: string; value: string; icon: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="w-full text-left bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-all hover:scale-[1.03] hover:border-[#39FF14]/30 active:scale-95 group">
    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#39FF14]/10 transition-colors shadow-inner">{icon}</div>
    <div className="min-w-0">
      <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] truncate mb-1">{title}</p>
      <h4 className="text-base lg:text-xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{value}</h4>
    </div>
  </button>
);

export default Dashboard;
