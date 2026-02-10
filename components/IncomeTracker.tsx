
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, ExpenseCategory, BankAccount, Wallet } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Plus, Trash2, Banknote, Edit2, XCircle, TrendingUp, Filter } from 'lucide-react';
import { getCategoryIcon } from '../constants';
import ConfirmModal from './ConfirmModal';

interface IncomeTrackerProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  wallets: Wallet[];
  categories: Record<ExpenseCategory, string[]>;
  onAdd: (t: Transaction) => void;
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const IncomeTracker: React.FC<IncomeTrackerProps> = ({ transactions, accounts, wallets, categories, onAdd, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<ExpenseCategory>('Personal');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    subCategory: categories['Personal'][0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    sourceId: accounts[0]?.id || wallets[0]?.id || ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount.toString(),
        subCategory: editingTransaction.subCategory,
        description: editingTransaction.description,
        date: editingTransaction.date,
        sourceId: editingTransaction.sourceId || ''
      });
      setActiveTab(editingTransaction.category);
      setShowAddForm(true);
    }
  }, [editingTransaction]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income' && t.category === activeTab && (sourceFilter === 'all' || t.sourceId === sourceFilter))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeTab, sourceFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.sourceId) return;

    const txData: Transaction = {
      id: editingTransaction ? editingTransaction.id : Math.random().toString(36).substr(2, 9),
      amount: parseFloat(formData.amount),
      type: 'income',
      category: activeTab,
      subCategory: formData.subCategory,
      description: formData.description,
      date: formData.date,
      sourceId: formData.sourceId
    };

    if (editingTransaction) {
      onUpdate(txData);
      setEditingTransaction(null);
    } else {
      onAdd(txData);
    }

    resetForm();
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      subCategory: categories[activeTab][0],
      description: '',
      date: new Date().toISOString().split('T')[0],
      sourceId: accounts[0]?.id || wallets[0]?.id || ''
    });
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <ConfirmModal 
        isOpen={idToDelete !== null} 
        onClose={() => setIdToDelete(null)} 
        onConfirm={() => { onDelete(idToDelete!); setIdToDelete(null); }}
        title="Delete Income Record?"
        message="This will remove the entry and deduct the amount from your account balance."
      />

      <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded-2xl w-full">
        {(['Personal', 'Business'] as ExpenseCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
              activeTab === cat ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' : 'text-slate-500 dark:text-slate-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {!showAddForm && (
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-full bg-emerald-600 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus size={24} /> New Income Entry
        </button>
      )}

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
              <Banknote size={20} className="text-emerald-500" /> {editingTransaction ? 'Edit Entry' : 'Log Income'}
            </h3>
            <button onClick={() => { setShowAddForm(false); resetForm(); }} className="p-2 text-slate-400"><XCircle size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-emerald-500"
                  placeholder="e.g. Monthly Salary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-black dark:text-white focus:ring-2 ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold dark:text-white focus:ring-2 ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Deposit To</label>
              <select
                required
                value={formData.sourceId}
                onChange={e => setFormData({ ...formData, sourceId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white appearance-none"
              >
                <optgroup label="Banks">
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.name}</option>)}
                </optgroup>
                <optgroup label="Wallets & UPI">
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.nickname || w.name}</option>)}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Source Category</label>
              <select
                value={formData.subCategory}
                onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white appearance-none"
              >
                {categories[activeTab].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              {editingTransaction ? 'Update Entry' : 'Save Income'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-emerald-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-lg shadow-emerald-500/20">
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total {activeTab} Income</p>
            <p className="text-3xl font-black tracking-tight">{formatCurrency(filteredTransactions.reduce((acc, t) => acc + t.amount, 0))}</p>
         </div>
         <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
         </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Transaction History</h3>
           <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={sourceFilter} 
                onChange={e => setSourceFilter(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase text-blue-500 border-none focus:ring-0 outline-none p-0 cursor-pointer"
              >
                <option value="all">All Sources</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.name}</option>)}
                {wallets.map(w => <option key={w.id} value={w.id}>{w.nickname || w.name}</option>)}
              </select>
           </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs italic bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
             No entries found for this category.
          </div>
        ) : (
          filteredTransactions.map(tx => (
            <div 
              key={tx.id} 
              className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
                  {getCategoryIcon(tx.subCategory)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{tx.description || tx.subCategory}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{tx.date} • {tx.subCategory}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <p className="text-sm font-black text-emerald-500">+{formatCurrency(tx.amount)}</p>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingTransaction(tx)} className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => setIdToDelete(tx.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncomeTracker;
