
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, ExpenseCategory, BankAccount, Wallet, Loan } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Plus, Trash2, Banknote, Edit2, XCircle, TrendingUp, Filter, Settings, Save, Check, X, Link as LinkIcon, Info } from 'lucide-react';
import { getCategoryIcon } from '../constants';
import ConfirmModal from './ConfirmModal';

interface IncomeTrackerProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  wallets: Wallet[];
  loans: Loan[];
  categories: Record<ExpenseCategory, string[]>;
  onAdd: (t: Transaction) => void;
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onAddCategory: (cat: ExpenseCategory, sub: string) => void;
  onUpdateCategory: (cat: ExpenseCategory, oldSub: string, newSub: string) => void;
  onDeleteCategory: (cat: ExpenseCategory, sub: string) => void;
}

const IncomeTracker: React.FC<IncomeTrackerProps> = ({ 
  transactions, 
  accounts, 
  wallets, 
  loans,
  categories, 
  onAdd, 
  onUpdate, 
  onDelete,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [activeTab, setActiveTab] = useState<ExpenseCategory>('Personal');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    subCategory: categories[activeTab]?.[0] || 'Other',
    description: '',
    date: new Date().toISOString().split('T')[0],
    sourceId: accounts[0]?.id || wallets[0]?.id || '',
    loanId: ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount.toString(),
        subCategory: editingTransaction.subCategory,
        description: editingTransaction.description,
        date: editingTransaction.date,
        sourceId: editingTransaction.sourceId || '',
        loanId: editingTransaction.loanId || ''
      });
      setActiveTab(editingTransaction.category);
      setShowAddForm(true);
    }
  }, [editingTransaction]);

  useEffect(() => {
    if (!categories[activeTab]?.includes(formData.subCategory)) {
        setFormData(prev => ({ ...prev, subCategory: categories[activeTab]?.[0] || 'Other' }));
    }
  }, [activeTab, categories]);

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
      sourceId: formData.sourceId,
      loanId: formData.loanId || undefined
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
      subCategory: categories[activeTab]?.[0] || 'Other',
      description: '',
      date: new Date().toISOString().split('T')[0],
      sourceId: accounts[0]?.id || wallets[0]?.id || '',
      loanId: ''
    });
    setEditingTransaction(null);
  };

  const getLoanName = (id?: string) => {
    if (!id) return null;
    return loans.find(l => l.id === id)?.name;
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

      <CategoryManagerModal 
        isOpen={showCategoryManager} 
        onClose={() => setShowCategoryManager(false)}
        activeTab={activeTab}
        categories={categories[activeTab] || []}
        onAdd={(sub) => onAddCategory(activeTab, sub)}
        onUpdate={(oldSub, newSub) => onUpdateCategory(activeTab, oldSub, newSub)}
        onDelete={(sub) => onDeleteCategory(activeTab, sub)}
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
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex-1 bg-emerald-600 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus size={24} /> New Income Entry
          </button>
          <button 
            onClick={() => setShowCategoryManager(true)}
            className="p-5 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center"
            title="Manage Categories"
          >
            <Settings size={24} />
          </button>
        </div>
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Description (Optional)</label>
                <input
                  type="text"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Link to Loan (Disbursement)</label>
                <select
                  value={formData.loanId}
                  onChange={e => setFormData({ ...formData, loanId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white appearance-none"
                >
                  <option value="">No Loan Linked</option>
                  {loans.map(loan => <option key={loan.id} value={loan.id}>{loan.name}</option>)}
                </select>
                {formData.loanId && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-2">
                    <Info size={10} /> Syncs with your loan portfolio automatically.
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Source Category</label>
              <div className="flex gap-2">
                <select
                    value={formData.subCategory}
                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white appearance-none transition-all"
                >
                    {categories[activeTab].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button 
                  type="button" 
                  onClick={() => setShowCategoryManager(true)}
                  className="p-4 bg-slate-200 dark:bg-slate-700 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all text-slate-600 dark:text-slate-300"
                >
                  <Settings size={20} />
                </button>
              </div>
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
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{tx.date} • {tx.subCategory}</p>
                    {tx.loanId && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[8px] font-black uppercase tracking-wider">
                        <LinkIcon size={8} /> Loan Ref: {getLoanName(tx.loanId)}
                      </div>
                    )}
                  </div>
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

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ExpenseCategory;
  categories: string[];
  onAdd: (sub: string) => void;
  onUpdate: (oldSub: string, newSub: string) => void;
  onDelete: (sub: string) => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, activeTab, categories, onAdd, onUpdate, onDelete }) => {
  const [newCat, setNewCat] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    onAdd(newCat.trim());
    setNewCat('');
  };

  const startEdit = (index: number, val: string) => {
    setEditingIndex(index);
    setEditingVal(val);
  };

  const handleUpdate = (oldVal: string) => {
    if (!editingVal.trim() || editingVal.trim() === oldVal) {
      setEditingIndex(null);
      return;
    }
    onUpdate(oldVal, editingVal.trim());
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Manage {activeTab} Income Sources
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="New Source Name" 
            value={newCat} 
            onChange={e => setNewCat(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 ring-emerald-500"
          />
          <button type="submit" className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
            <Plus size={20} />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar">
          {categories.map((cat, idx) => (
            <div key={cat} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center justify-between group">
              {editingIndex === idx ? (
                <div className="flex-1 flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={editingVal} 
                    onChange={e => setEditingVal(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-sm font-bold dark:text-white"
                  />
                  <button onClick={() => handleUpdate(cat)} className="text-emerald-500"><Check size={18} /></button>
                  <button onClick={() => setEditingIndex(null)} className="text-slate-400"><X size={18} /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-emerald-500">
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{cat}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(idx, cat)} className="p-1.5 text-slate-400 hover:text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(cat)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
          Tap icon to edit or delete
        </div>
      </div>
    </div>
  );
};

export default IncomeTracker;
