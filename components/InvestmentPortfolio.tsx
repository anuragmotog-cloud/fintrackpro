
import React, { useState } from 'react';
import { Investment } from '../types';
import { formatCurrency } from '../utils/calculations';
import { TrendingUp, Plus, Trash2, ArrowUpRight, ArrowDownRight, Briefcase, PieChart, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ConfirmModal from './ConfirmModal';

interface InvestmentPortfolioProps {
  investments: Investment[];
  onAdd: (inv: Investment) => void;
  onDelete: (id: string) => void;
}

const InvestmentPortfolio: React.FC<InvestmentPortfolioProps> = ({ investments, onAdd, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    buyPrice: '',
    currentPrice: '',
    quantity: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      buyPrice: parseFloat(formData.buyPrice),
      currentPrice: parseFloat(formData.currentPrice),
      quantity: parseFloat(formData.quantity),
      date: new Date().toISOString().split('T')[0],
    });
    setFormData({ name: '', buyPrice: '', currentPrice: '', quantity: '' });
    setShowAdd(false);
  };

  const confirmDelete = () => {
    if (idToDelete) {
      onDelete(idToDelete);
      setIdToDelete(null);
    }
  };

  const generateTrendData = (buyPrice: number, currentPrice: number) => {
    // Simulated growth curve for visualization
    const steps = 7;
    const data = [];
    const diff = currentPrice - buyPrice;
    
    for (let i = 0; i < steps; i++) {
        const randomness = (Math.random() - 0.5) * (diff * 0.2);
        const progress = i / (steps - 1);
        const val = buyPrice + (diff * progress) + randomness;
        data.push({
            name: `P${i}`,
            price: Math.max(buyPrice * 0.5, val)
        });
    }
    // Ensure last one is exact
    data[steps-1].price = currentPrice;
    return data;
  };

  const totalCost = investments.reduce((acc, inv) => acc + inv.buyPrice * inv.quantity, 0);
  const totalValue = investments.reduce((acc, inv) => acc + inv.currentPrice * inv.quantity, 0);
  const totalPnL = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div className="space-y-6 lg:space-y-8 animate-in zoom-in-95 duration-500 pb-10">
      <ConfirmModal 
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Asset?"
        message="Are you sure you want to remove this asset from your portfolio? This action is permanent."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-2">Total Portfolio Value</p>
          <h3 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">{formatCurrency(totalValue)}</h3>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Invested</p>
              <p className="text-sm lg:text-base font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalCost)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Net P&L</p>
              <div className={`flex items-center gap-1 font-black text-sm lg:text-base ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalPnL >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>{formatCurrency(Math.abs(totalPnL))} ({pnlPercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-blue-600 dark:bg-blue-700 p-6 lg:p-8 rounded-3xl shadow-xl shadow-blue-500/20 text-white flex-1 flex flex-col justify-between group overflow-hidden relative">
            <TrendingUp size={120} className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-1">Market Performance</h4>
              <p className="text-blue-100 text-xs font-medium opacity-80">Track your assets against purchase price</p>
            </div>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="mt-6 w-full bg-white text-blue-600 font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-lg active:scale-[0.98] relative z-10"
            >
              <Plus size={24} />
              Add New Asset
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-blue-100 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart size={20} className="text-blue-500" />
              Asset Details
            </h3>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><Plus size={20} className="rotate-45" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Asset Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Nifty 50 ETF"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Buy Price (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.buyPrice}
                onChange={e => setFormData({ ...formData, buyPrice: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Current Price (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.currentPrice}
                onChange={e => setFormData({ ...formData, currentPrice: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Quantity</label>
              <input
                required
                type="number"
                step="0.001"
                placeholder="1.00"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white transition-all"
              />
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <button type="submit" className="w-full lg:w-auto bg-slate-900 dark:bg-blue-600 text-white font-black px-12 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl">
                Add to Portfolio
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {investments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-600 animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] flex items-center justify-center mb-8 ring-[12px] ring-blue-50/50 dark:ring-blue-900/5 shadow-inner">
              <Briefcase size={48} className="text-blue-500 dark:text-blue-700" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Your Portfolio is Empty</h4>
            <p className="max-w-md mx-auto text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
              Building wealth starts with the first asset. Add your stocks, mutual funds, gold, or other investments to track their performance in real-time.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-slate-900 dark:bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold hover:scale-[1.05] transition-transform active:scale-[0.98] shadow-xl shadow-black/20"
            >
              Get Started Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 no-scrollbar">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">
                <div className="col-span-3">Asset</div>
                <div className="col-span-1 text-right">Qty</div>
                <div className="col-span-2 text-right">Buy Price</div>
                <div className="col-span-2 text-right">P&L</div>
                <div className="col-span-2 text-right">Current Value</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {investments.map(inv => {
                  const invCost = inv.buyPrice * inv.quantity;
                  const invVal = inv.currentPrice * inv.quantity;
                  const invPnL = invVal - invCost;
                  const invPnLPerc = (invPnL / invCost) * 100;
                  const isExpanded = expandedId === inv.id;

                  return (
                    <React.Fragment key={inv.id}>
                        <div 
                          className={`grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                        >
                          <div className="col-span-3 flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black shrink-0">
                              {inv.name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 dark:text-white truncate">{inv.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{inv.date}</p>
                            </div>
                          </div>
                          <div className="col-span-1 text-right font-bold text-slate-600 dark:text-slate-400">{inv.quantity}</div>
                          <div className="col-span-2 text-right font-bold text-slate-600 dark:text-slate-400">
                            <p className="text-sm">{formatCurrency(inv.buyPrice)}</p>
                            <p className="text-[10px] opacity-60">BuyBasis: {formatCurrency(invCost)}</p>
                          </div>
                          <div className={`col-span-2 text-right font-black ${invPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1">
                                {invPnL >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                <span>{formatCurrency(Math.abs(invPnL))}</span>
                              </div>
                              <span className="text-[10px] opacity-80">{invPnLPerc.toFixed(2)}%</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                             <span className="font-black text-slate-900 dark:text-white">{formatCurrency(invVal)}</span>
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-2">
                             <button
                                onClick={(e) => { e.stopPropagation(); setIdToDelete(inv.id); }}
                                className="text-rose-400 hover:text-rose-600 p-2 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className="p-2 text-slate-400">
                                 {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                          </div>
                        </div>
                        {isExpanded && (
                            <div className="bg-slate-50 dark:bg-slate-950 px-8 py-8 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 h-[200px]">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Historical Performance Trend</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={generateTrendData(inv.buyPrice, inv.currentPrice)}>
                                                <defs>
                                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={invPnL >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor={invPnL >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 900 }}
                                                    labelStyle={{ display: 'none' }}
                                                    formatter={(val: number) => [formatCurrency(val), 'Market Price']}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="price" 
                                                    stroke={invPnL >= 0 ? "#10b981" : "#f43f5e"} 
                                                    fillOpacity={1} 
                                                    fill="url(#colorPrice)" 
                                                    strokeWidth={3}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Asset Allocation</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Share of Portfolio</span>
                                                <span className="text-sm font-black text-slate-900 dark:text-white">{((invVal / totalValue) * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(invVal / totalValue) * 100}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Breakdown</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-slate-500">Capital Invested</span>
                                                    <span className="text-slate-900 dark:text-white">{formatCurrency(invCost)}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-slate-500">Unrealized Gain</span>
                                                    <span className={invPnL >= 0 ? "text-emerald-500" : "text-rose-500"}>{formatCurrency(invPnL)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentPortfolio;
