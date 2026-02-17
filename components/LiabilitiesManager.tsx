
import React, { useState } from 'react';
import { Loan } from '../types';
import { calculateEMI, formatCurrency, calculatePayoffProjection } from '../utils/calculations';
import { Plus, CreditCard, Calendar, Percent, Clock, Trash2, Bell, BellOff, CalendarCheck, Info, Sparkles, TrendingDown, ChevronRight } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface LiabilitiesManagerProps {
  loans: Loan[];
  onAdd: (loan: Loan) => void;
  onDelete: (id: string) => void;
  onUpdatePaid: (id: string, amount: number) => void;
}

const LiabilitiesManager: React.FC<LiabilitiesManagerProps> = ({ loans, onDelete, onUpdatePaid, onAdd }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    interestRate: '',
    tenure: '',
    reminderDay: '1',
    remindersEnabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      principal: parseFloat(formData.principal),
      interestRate: parseFloat(formData.interestRate),
      tenure: parseInt(formData.tenure),
      paidAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      reminderDay: parseInt(formData.reminderDay),
      remindersEnabled: formData.remindersEnabled
    });
    setFormData({ name: '', principal: '', interestRate: '', tenure: '', reminderDay: '1', remindersEnabled: true });
    setShowAdd(false);
  };

  const confirmDelete = () => {
    if (idToDelete) {
      onDelete(idToDelete);
      setIdToDelete(null);
    }
  };

  const getPayoffDate = (months: number) => {
    if (!isFinite(months)) return "Never";
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      <ConfirmModal 
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Liability?"
        message="Are you sure you want to remove this loan? This data cannot be recovered."
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Debt & Liabilities</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Strategic debt management and payoff tracking.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full sm:w-auto bg-blue-600 dark:bg-blue-600 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} />
          {showAdd ? 'Cancel' : 'Register New Loan'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2.5rem] border border-blue-100 dark:border-slate-800 shadow-xl animate-in fade-in zoom-in duration-300">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
            <CreditCard size={20} className="text-blue-500" /> New Liability Entry
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Loan Identifier</label>
              <input
                required
                type="text"
                placeholder="e.g. HDFC Home Loan"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Total Principal (₹)</label>
              <input
                required
                type="number"
                placeholder="0"
                value={formData.principal}
                onChange={e => setFormData({ ...formData, principal: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-black dark:text-white focus:ring-2 ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Interest Rate (%)</label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="8.5"
                value={formData.interestRate}
                onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Tenure (Months)</label>
              <input
                required
                type="number"
                placeholder="60"
                value={formData.tenure}
                onChange={e => setFormData({ ...formData, tenure: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Monthly Due Day</label>
              <input
                required
                type="number"
                min="1"
                max="31"
                placeholder="5"
                value={formData.reminderDay}
                onChange={e => setFormData({ ...formData, reminderDay: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 md:col-span-2 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.remindersEnabled}
                  onChange={e => setFormData({ ...formData, remindersEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enable Repayment Alarms</span>
              </label>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button type="submit" className="w-full sm:w-auto bg-slate-900 dark:bg-blue-600 text-white font-black px-12 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl">
                Add Loan Portfolio
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {loans.length === 0 ? (
          <div className="col-span-full py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
               <CreditCard size={48} className="text-slate-300" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No Active Liabilities</h4>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm mx-auto mb-10 font-medium">Tracking your loans helps optimize repayment strategies and improve your net worth visualization.</p>
            <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mx-auto">
               <Plus size={16} /> Register First Debt
            </button>
          </div>
        ) : (
          loans.map(loan => {
            const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenure);
            const outstanding = loan.principal - loan.paidAmount;
            const progress = (loan.paidAmount / loan.principal) * 100;
            const projection = calculatePayoffProjection(outstanding, loan.interestRate, emi);

            return (
              <div key={loan.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">
                        {loan.name}
                      </h3>
                      {loan.remindersEnabled ? (
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400 shadow-sm" title="Reminders Active">
                           <Bell size={14} />
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-full text-slate-300 dark:text-slate-600">
                           <BellOff size={14} />
                        </div>
                      )}
                    </div>
                    
                    {/* Prominent Interest & Tenure Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl flex items-center gap-2">
                         <Percent size={14} className="text-blue-600 dark:text-blue-400" />
                         <span className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tighter">{loan.interestRate}% <span className="text-[9px] opacity-60 ml-0.5">APR</span></span>
                      </div>
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl flex items-center gap-2">
                         <Clock size={14} className="text-slate-500 dark:text-slate-400" />
                         <span className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tighter">{loan.tenure} <span className="text-[9px] opacity-60 ml-0.5">MONTHS</span></span>
                      </div>
                      {loan.remindersEnabled && (
                        <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center gap-2">
                           <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />
                           <span className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tighter">DAY {loan.reminderDay}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button onClick={() => setIdToDelete(loan.id)} className="text-slate-300 hover:text-rose-500 p-2 rounded-xl transition-colors shrink-0">
                    <Trash2 size={22} />
                  </button>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] shadow-inner flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest">Fixed Monthly EMI</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none truncate">{formatCurrency(emi)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] shadow-inner flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest">Remaining Balance</p>
                    <p className="text-2xl font-black text-rose-500 dark:text-rose-400 leading-none truncate">{formatCurrency(outstanding)}</p>
                  </div>
                </div>

                {/* Enhanced Progress Visualization */}
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-3 px-1">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Capital</p>
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(loan.paidAmount)}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Principal</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(loan.principal)}</p>
                    </div>
                  </div>
                  
                  <div className="relative h-5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-1 border border-slate-100 dark:border-white/5 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                      style={{ width: `${progress}%` }}
                    >
                      {progress > 10 && (
                        <div className="h-full flex items-center justify-end px-3">
                           <span className="text-[8px] font-black text-white drop-shadow-md">{progress.toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2 px-1">
                     <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                        <span className="text-[9px] font-black text-slate-400 uppercase">Paid Amount</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Remaining</span>
                        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                     </div>
                  </div>
                </div>

                {/* Payoff Projection Section */}
                <div className="bg-slate-950 dark:bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5 space-y-5 shadow-2xl relative group/projection overflow-hidden mb-10">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/projection:opacity-[0.08] transition-opacity">
                      <Sparkles size={80} className="text-amber-400" />
                   </div>
                    <div className="flex items-center gap-2 mb-1 relative z-10">
                       <Sparkles size={16} className="text-amber-400" />
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Smart Payoff AI Projection</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><CalendarCheck size={12} className="text-amber-400" /> Est. Freedom Date</p>
                          <p className="text-lg font-black text-white tracking-tighter">{getPayoffDate(projection.months)}</p>
                       </div>
                       <div className="space-y-1 text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 justify-end"><TrendingDown size={12} className="text-amber-400" /> Cost of Debt</p>
                          <p className="text-lg font-black text-amber-400 tracking-tighter">{formatCurrency(projection.totalInterest)}</p>
                       </div>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-white/5 relative z-10">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Installments Left</p>
                       <span className="px-3 py-1 bg-amber-400/10 text-amber-400 rounded-lg text-[10px] font-black border border-amber-400/20">
                         {projection.months} MONTHS
                       </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => onUpdatePaid(loan.id, emi)}
                    className="flex-1 bg-slate-900 dark:bg-blue-600 text-white font-black py-4.5 rounded-[1.5rem] hover:opacity-90 transition-all text-[11px] uppercase tracking-[0.1em] active:scale-95 shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2"
                  >
                    Post Monthly EMI <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => onUpdatePaid(loan.id, loan.principal * 0.1)}
                    className="flex-1 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-300 font-black py-4.5 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-[11px] uppercase tracking-[0.1em] active:scale-95 flex items-center justify-center gap-2"
                  >
                    Prepay 10% <TrendingDown size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[3rem] border border-amber-100 dark:border-amber-900/30 flex flex-col md:flex-row items-center gap-6">
         <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Info size={32} />
         </div>
         <div className="text-center md:text-left">
            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Debt Optimization Intel</h4>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Every prepay amount reduces your <span className="text-slate-900 dark:text-white font-bold">Principal Balance</span> directly. This triggers a compounding reduction in future interest and shifts your Freedom Date closer to the present.
            </p>
         </div>
      </div>
    </div>
  );
};

export default LiabilitiesManager;
