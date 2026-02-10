import React, { useState } from 'react';
import { BankAccount, CreditCard as CreditCardType } from '../types';
import { Landmark, CreditCard, Plus, Trash2, Wallet, Calendar, Edit2, Check, X as CloseIcon, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { BANK_OPTIONS, CARD_OPTIONS } from '../constants';
import ConfirmModal from './ConfirmModal';

interface AccountsManagerProps {
  accounts: BankAccount[];
  creditCards: CreditCardType[];
  bankOptions: string[];
  cardOptions: string[];
  onAddAccount: (acc: BankAccount) => void;
  onAddCard: (card: CreditCardType) => void;
  onUpdateAccount: (acc: BankAccount) => void;
  onUpdateCard: (card: CreditCardType) => void;
  onDeleteAccount: (id: string) => void;
  onDeleteCard: (id: string) => void;
}

const AccountsManager: React.FC<AccountsManagerProps> = ({ 
  accounts, 
  creditCards, 
  bankOptions,
  cardOptions,
  onAddAccount, 
  onAddCard, 
  onUpdateAccount,
  onUpdateCard,
  onDeleteAccount, 
  onDeleteCard 
}) => {
  const [activeTab, setActiveTab] = useState<'banks' | 'cards'>('banks');
  const [showAdd, setShowAdd] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'bank' | 'card' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNickname, setTempNickname] = useState('');
  const [tempLimit, setTempLimit] = useState('');
  const [tempOutstanding, setTempOutstanding] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');
  
  const [bankFormData, setBankFormData] = useState({ name: bankOptions[0] || BANK_OPTIONS[0], balance: '', nickname: '' });
  const [cardFormData, setCardFormData] = useState({ name: cardOptions[0] || CARD_OPTIONS[0], limit: '', outstanding: '0', dueDate: '1', nickname: '' });

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAccount({
      id: Math.random().toString(36).substr(2, 9),
      name: bankFormData.name,
      nickname: bankFormData.nickname || undefined,
      balance: parseFloat(bankFormData.balance),
      type: 'bank'
    });
    setBankFormData({ name: bankOptions[0] || BANK_OPTIONS[0], balance: '', nickname: '' });
    setShowAdd(false);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCard({
      id: Math.random().toString(36).substr(2, 9),
      name: cardFormData.name,
      nickname: cardFormData.nickname || undefined,
      limit: parseFloat(cardFormData.limit),
      outstanding: parseFloat(cardFormData.outstanding),
      dueDate: parseInt(cardFormData.dueDate),
      type: 'card'
    });
    setCardFormData({ name: cardOptions[0] || CARD_OPTIONS[0], limit: '', outstanding: '0', dueDate: '1', nickname: '' });
    setShowAdd(false);
  };

  const handleUpdateItem = (item: BankAccount | CreditCardType) => {
    if (item.type === 'bank') {
      onUpdateAccount({ ...item as BankAccount, nickname: tempNickname || undefined });
    } else {
      const card = item as CreditCardType;
      onUpdateCard({ 
        ...card, 
        nickname: tempNickname || undefined,
        limit: parseFloat(tempLimit) || card.limit,
        outstanding: parseFloat(tempOutstanding) || card.outstanding,
        dueDate: parseInt(tempDueDate) || card.dueDate
      });
    }
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'bank') onDeleteAccount(itemToDelete.id);
      else onDeleteCard(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const getUtilizationStatus = (percent: number) => {
    if (percent > 75) return { 
      label: 'Critical', 
      color: 'text-rose-400', 
      bar: 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]', 
      icon: <AlertCircle size={12} className="shrink-0" /> 
    };
    if (percent > 30) return { 
      label: 'Warning', 
      color: 'text-amber-400', 
      bar: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]', 
      icon: <AlertCircle size={12} className="shrink-0" /> 
    };
    return { 
      label: 'Safe', 
      color: 'text-emerald-400', 
      bar: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]', 
      icon: <CheckCircle2 size={12} className="shrink-0" /> 
    };
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      <ConfirmModal 
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete ${itemToDelete?.type === 'bank' ? 'Bank Account' : 'Credit Card'}?`}
        message={`Are you sure you want to remove this ${itemToDelete?.type === 'bank' ? 'account' : 'card'}? This might affect existing transaction history.`}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
          <button
            onClick={() => { setActiveTab('banks'); setShowAdd(false); }}
            className={`flex items-center gap-2 px-6 lg:px-8 py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all ${
              activeTab === 'banks' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Landmark size={16} /> Banks
          </button>
          <button
            onClick={() => { setActiveTab('cards'); setShowAdd(false); }}
            className={`flex items-center gap-2 px-6 lg:px-8 py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all ${
              activeTab === 'cards' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CreditCard size={16} /> Cards
          </button>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`w-full sm:w-auto text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
            activeTab === 'banks' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
          }`}
        >
          <Plus size={20} />
          {showAdd ? 'Cancel' : `Add ${activeTab === 'banks' ? 'Bank' : 'Card'}`}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in zoom-in duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            New {activeTab === 'banks' ? 'Bank Account' : 'Credit Card'} Details
          </h3>
          
          {activeTab === 'banks' ? (
            <form onSubmit={handleBankSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Nickname (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My Salary Account"
                  value={bankFormData.nickname}
                  onChange={e => setBankFormData({ ...bankFormData, nickname: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Bank Name</label>
                <select
                  value={bankFormData.name}
                  onChange={e => setBankFormData({ ...bankFormData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white appearance-none"
                >
                  {bankOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Initial Balance (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="50000"
                  value={bankFormData.balance}
                  onChange={e => setBankFormData({ ...bankFormData, balance: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white font-bold px-10 py-3 rounded-xl hover:bg-blue-700 transition-all">Save Bank</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCardSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Nickname (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Spends Card"
                  value={cardFormData.nickname}
                  onChange={e => setCardFormData({ ...cardFormData, nickname: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Card Name</label>
                <select
                  value={cardFormData.name}
                  onChange={e => setCardFormData({ ...cardFormData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium dark:text-white appearance-none"
                >
                  {cardOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Credit Limit (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="100000"
                  value={cardFormData.limit}
                  /* Fix: Changed ...formData to ...cardFormData to resolve 'Cannot find name formData' error */
                  onChange={e => setCardFormData({ ...cardFormData, limit: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Bill Due Date (Day)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="31"
                  placeholder="5"
                  value={cardFormData.dueDate}
                  onChange={e => setCardFormData({ ...cardFormData, dueDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium dark:text-white"
                />
              </div>
              <div className="lg:col-span-3 flex justify-end">
                <button type="submit" className="bg-rose-600 text-white font-bold px-10 py-3 rounded-xl hover:bg-rose-700 transition-all">Save Card</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[450px]">
        {activeTab === 'banks' ? (
          accounts.length === 0 ? (
            <div className="col-span-full py-16 px-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] flex items-center justify-center mb-8 ring-[12px] ring-blue-50/50 dark:ring-blue-900/5 shadow-inner transition-all">
                <Landmark size={48} className="text-blue-500 dark:text-blue-700" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Your Bank Vault is Ready</h4>
              <p className="max-w-md mx-auto text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                Connect your primary savings or current accounts to get a bird's-eye view of your available liquidity and track inflows automatically.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black hover:scale-[1.05] transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20 flex items-center gap-2"
                >
                  <Plus size={20} /> Add Your First Bank
                </button>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  <ShieldCheck size={14} /> Encrypted & Private
                </div>
              </div>
            </div>
          ) : (
            accounts.map(acc => (
              <div key={acc.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black">
                    <Landmark size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(acc.id); setTempNickname(acc.nickname || ''); }} className="text-slate-400 p-2 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setItemToDelete({ id: acc.id, type: 'bank' })} className="text-rose-400 p-2 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {editingId === acc.id ? (
                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="text"
                      value={tempNickname}
                      onChange={e => setTempNickname(e.target.value)}
                      placeholder="Enter nickname"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm focus:ring-2 ring-blue-500 outline-none dark:text-white"
                      autoFocus
                    />
                    <button onClick={() => handleUpdateItem(acc)} className="text-emerald-500"><Check size={20}/></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400"><CloseIcon size={20}/></button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">
                      {acc.nickname || acc.name}
                    </h3>
                    {acc.nickname && <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase">{acc.name}</p>}
                    {!acc.nickname && <div className="h-4 mb-4"></div>}
                  </>
                )}
                
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Current Balance</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(acc.balance)}</p>
              </div>
            ))
          )
        ) : (
          creditCards.length === 0 ? (
            <div className="col-span-full py-16 px-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/10 rounded-[3rem] flex items-center justify-center mb-8 ring-[12px] ring-rose-50/50 dark:ring-rose-900/5 shadow-inner transition-all">
                <CreditCard size={48} className="text-rose-500 dark:text-rose-700" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Master Your Credit</h4>
              <p className="max-w-md mx-auto text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                Add your credit cards to monitor spending limits, track utilization, and never miss a due date with automated reminders.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-rose-600 text-white px-10 py-3.5 rounded-2xl font-black hover:scale-[1.05] transition-all active:scale-[0.98] shadow-xl shadow-rose-500/20 flex items-center gap-2"
                >
                  <Plus size={20} /> Add Your First Card
                </button>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  <Sparkles size={14} className="text-amber-500" /> Optimize Utilization
                </div>
              </div>
            </div>
          ) : (
            creditCards.map(card => {
              const utilization = (card.outstanding / card.limit) * 100;
              const status = getUtilizationStatus(utilization);

              return (
                <div key={card.id} className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl shadow-slate-950/20 text-white group relative overflow-hidden transition-all hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <CreditCardIcon size={120} />
                  </div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                      <Wallet size={20} />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { 
                        setEditingId(card.id); 
                        setTempNickname(card.nickname || ''); 
                        setTempLimit(card.limit.toString());
                        setTempOutstanding(card.outstanding.toString());
                        setTempDueDate(card.dueDate.toString());
                      }} className="text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 p-2">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setItemToDelete({ id: card.id, type: 'card' })} className="text-slate-500 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 p-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {editingId === card.id ? (
                    <div className="space-y-4 relative z-10 animate-in fade-in duration-300">
                      <div>
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1 block">Nickname</label>
                        <input
                          type="text"
                          value={tempNickname}
                          onChange={e => setTempNickname(e.target.value)}
                          placeholder="Enter nickname"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-white/30 outline-none text-white transition-all"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1 block">Limit (₹)</label>
                          <input
                            type="number"
                            value={tempLimit}
                            onChange={e => setTempLimit(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-white/30 outline-none text-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1 block">O/S (₹)</label>
                          <input
                            type="number"
                            value={tempOutstanding}
                            onChange={e => setTempOutstanding(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-white/30 outline-none text-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1 block">Due Day (1-31)</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={tempDueDate}
                          onChange={e => setTempDueDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-white/30 outline-none text-white transition-all"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => handleUpdateItem(card)} className="bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"><Check size={20}/></button>
                        <button onClick={() => setEditingId(null)} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"><CloseIcon size={20}/></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-black mb-1 tracking-tighter uppercase relative z-10 truncate leading-none">
                        {card.nickname || card.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-8 relative z-10">
                         {card.nickname ? (
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{card.name}</p>
                         ) : (
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-slate-500"/>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Due: Day {card.dueDate}</p>
                            </div>
                         )}
                      </div>
                      
                      <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5 opacity-60">Outstanding</p>
                            <p className="text-2xl font-black tracking-tight">{formatCurrency(card.outstanding)}</p>
                          </div>
                          <div className="text-right min-w-0">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5 opacity-60">Limit</p>
                            <p className="text-sm font-bold opacity-80 truncate">{formatCurrency(card.limit)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Utilization</span>
                              <div className={`flex items-center gap-1 py-0.5 px-2 rounded-full bg-white/5 border border-white/5 ${status.color}`}>
                                {status.icon}
                                <span className="text-[9px] font-black uppercase tracking-tighter">{status.label}</span>
                              </div>
                            </div>
                            <span className={`text-[11px] font-black ${status.color}`}>
                              {utilization.toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden p-[2.5px] border border-white/5 relative">
                            <div 
                              className={`h-full transition-all duration-1000 rounded-full ${status.bar}`}
                              style={{ width: `${Math.min(100, utilization)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

// Renamed locally for clarity within this file
const CreditCardIcon = CreditCard;

export default AccountsManager;