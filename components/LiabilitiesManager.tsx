
import React, { useState } from 'react';
import { Loan } from '../types';
import { calculateEMI, formatCurrency } from '../utils/calculations';
import { Plus, CreditCard, Calendar, Percent, Clock, Trash2, Bell, BellOff } from 'lucide-react';
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
          <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">Liabilities</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your loans and EMI progress.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full sm:w-auto bg-blue-600 dark:bg-blue-600 text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          {showAdd ? 'Cancel' : 'New Loan'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-blue-100 dark:border-slate-800 shadow-xl animate-in fade-in zoom-in duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">New Liability Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Loan Name</label>
              <input
                required
                type="text"
                placeholder="Home Mortgage"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Principal (₹)</label>
              <input
                required
                type="number"
                placeholder="500000"
                value={formData.principal}
                onChange={e => setFormData({ ...formData, principal: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Interest Rate (%)</label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="8.5"
                value={formData.interestRate}
                onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Tenure (Months)</label>
              <input
                required
                type="number"
                placeholder="48"
                value={formData.tenure}
                onChange={e => setFormData({ ...formData, tenure: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Reminder Day</label>
              <input
                required
                type="number"
                min="1"
                max="31"
                placeholder="5"
                value={formData.reminderDay}
                onChange={e => setFormData({ ...formData, reminderDay: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
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
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Enable Payment Reminders</span>
              </label>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-blue-700 transition-all">
                Create Loan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {loans.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <CreditCard size={48} className="text-slate-200 dark:text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No active liabilities found.</p>
          </div>
        ) : (
          loans.map(loan => {
            const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenure);
            const outstanding = loan.principal - loan.paidAmount;
            const progress = (loan.paidAmount / loan.principal) * 100;

            return (
              <div key={loan.id} className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="min-w-0">
                    <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white truncate mb-1 flex items-center gap-2">
                      {loan.name}
                      {loan.remindersEnabled ? (
                        <Bell size={14} className="text-blue-500" />
                      ) : (
                        <BellOff size={14} className="text-slate-300" />
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter"><Percent size={12}/> {loan.interestRate}% APR</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter"><Clock size={12}/> {loan.tenure} Months</span>
                      {loan.remindersEnabled && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-tighter"><Calendar size={12}/> Due: Day {loan.reminderDay}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setIdToDelete(loan.id)} className="text-rose-400 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors lg:opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-6 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1">Monthly EMI</p>
                    <p className="text-base lg:text-xl font-black text-blue-600 dark:text-blue-400 truncate">{formatCurrency(emi)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1">Left to Pay</p>
                    <p className="text-base lg:text-xl font-black text-rose-500 dark:text-rose-400 truncate">{formatCurrency(outstanding)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Repayment</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => onUpdatePaid(loan.id, emi)}
                      className="flex-1 bg-slate-900 dark:bg-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-xs uppercase tracking-widest"
                    >
                      Pay EMI
                    </button>
                    <button
                      onClick={() => onUpdatePaid(loan.id, loan.principal * 0.1)}
                      className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
                    >
                      Prepay 10%
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiabilitiesManager;
