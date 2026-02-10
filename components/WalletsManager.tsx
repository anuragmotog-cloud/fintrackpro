import React, { useState } from 'react';
// Renamed Wallet to WalletIcon and CreditCard to CreditCardIcon to avoid potential naming conflicts with types
import { Wallet as WalletIcon, SmartphoneNfc, Plus, Trash2, Smartphone, CreditCard as CreditCardIcon, ShieldCheck, Edit2, Check, X, QrCode } from 'lucide-react';
import { Wallet } from '../types';
import { formatCurrency } from '../utils/calculations';
import { WALLET_PROVIDERS } from '../constants';
import ConfirmModal from './ConfirmModal';

interface WalletsManagerProps {
  wallets: Wallet[];
  onAdd: (wallet: Wallet) => void;
  onUpdate: (wallet: Wallet) => void;
  onDelete: (id: string) => void;
}

const WalletsManager: React.FC<WalletsManagerProps> = ({ wallets, onAdd, onUpdate, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: WALLET_PROVIDERS[0],
    nickname: '',
    balance: '',
    provider: 'upi' as 'upi' | 'wallet'
  });

  const [tempNickname, setTempNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      nickname: formData.nickname || undefined,
      balance: parseFloat(formData.balance) || 0,
      type: 'wallet',
      provider: formData.provider
    });
    setFormData({ name: WALLET_PROVIDERS[0], nickname: '', balance: '', provider: 'upi' });
    setShowAdd(false);
  };

  const handleUpdate = (wallet: Wallet) => {
    onUpdate({ ...wallet, nickname: tempNickname || wallet.nickname });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <ConfirmModal 
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={() => { onDelete(idToDelete!); setIdToDelete(null); }}
        title="Remove Payment Method?"
        message="This will delete the wallet record. Future transactions cannot use this source."
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Wallets & UPI</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Link your digital cash and virtual IDs.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full sm:w-auto bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Plus size={20} />
          {showAdd ? 'Cancel' : 'Add New Method'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
            <SmartphoneNfc size={20} className="text-emerald-500" /> Method Details
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Display Nickname</label>
              <input
                required
                type="text"
                placeholder="e.g. Personal GPay"
                value={formData.nickname}
                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Provider</label>
              <select
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white appearance-none"
              >
                {WALLET_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Initial Balance (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.balance}
                onChange={e => setFormData({ ...formData, balance: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, provider: 'upi' })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.provider === 'upi' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                >
                  Virtual ID (UPI)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, provider: 'wallet' })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.provider === 'wallet' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                >
                  Cash Wallet
                </button>
              </div>
            </div>
            <div className="lg:col-span-3 flex justify-end">
              <button type="submit" className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black px-12 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl">
                Link Method
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {wallets.length === 0 ? (
          <div className="col-span-full py-20 px-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-700">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <SmartphoneNfc size={40} className="text-slate-300" />
             </div>
             <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase">No Methods Linked</h4>
             <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-8">Add your UPI IDs or digital wallets to track small spends and daily income.</p>
             <button onClick={() => setShowAdd(true)} className="text-emerald-500 font-black uppercase text-xs hover:underline flex items-center justify-center gap-2 mx-auto">
                <Plus size={16} /> Link your first wallet
             </button>
          </div>
        ) : (
          wallets.map(wallet => (
            <div key={wallet.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${wallet.provider === 'upi' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                    {wallet.provider === 'upi' ? <QrCode size={24} /> : <Smartphone size={24} />}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingId(wallet.id); setTempNickname(wallet.nickname || ''); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={16}/></button>
                    <button onClick={() => setIdToDelete(wallet.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                  </div>
               </div>

               {editingId === wallet.id ? (
                 <div className="mb-4 flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={tempNickname}
                      onChange={e => setTempNickname(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm font-bold dark:text-white outline-none ring-1 ring-blue-500"
                    />
                    <button onClick={() => handleUpdate(wallet)} className="text-emerald-500"><Check size={20}/></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400"><X size={20}/></button>
                 </div>
               ) : (
                 <>
                   <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{wallet.nickname || wallet.name}</h3>
                   <div className="flex items-center gap-2 mb-6">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{wallet.name}</p>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{wallet.provider === 'upi' ? 'Virtual ID' : 'Direct Wallet'}</p>
                   </div>
                 </>
               )}

               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Balance</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(wallet.balance)}</p>
               </div>

               <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                    <ShieldCheck size={12} className="text-emerald-500" /> Linked Securely
                  </div>
                  {wallet.provider === 'upi' && (
                    <div className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-md text-[8px] font-black uppercase tracking-wider">
                      UPI 2.0 Enabled
                    </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WalletsManager;
