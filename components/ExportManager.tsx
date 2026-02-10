
import React, { useState } from 'react';
import { FinancialData, Transaction, Investment, Budget } from '../types';
import { formatCurrency } from '../utils/calculations';
import { FileDown, Printer, Calendar, CheckCircle2, FileText, Download, Briefcase, TrendingUp, PieChart } from 'lucide-react';

interface ExportManagerProps {
  data: FinancialData;
}

const ExportManager: React.FC<ExportManagerProps> = ({ data }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportSections, setExportSections] = useState({
    transactions: true,
    investments: true,
    budgets: true,
    accounts: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const filterByDate = (date: string) => {
    return date >= startDate && date <= endDate;
  };

  const generateCSV = () => {
    setIsExporting(true);
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Transactions
    if (exportSections.transactions) {
      csvContent += "SECTION: TRANSACTIONS\n";
      csvContent += "Date,Type,Category,Sub-Category,Amount,Description\n";
      data.transactions
        .filter(t => filterByDate(t.date))
        .forEach(t => {
          csvContent += `${t.date},${t.type},${t.category},${t.subCategory},${t.amount},"${t.description.replace(/"/g, '""')}"\n`;
        });
      csvContent += "\n";
    }

    // Investments
    if (exportSections.investments) {
      csvContent += "SECTION: INVESTMENTS\n";
      csvContent += "Name,Buy Price,Current Price,Quantity,Total Value\n";
      data.investments.forEach(i => {
        csvContent += `${i.name},${i.buyPrice},${i.currentPrice},${i.quantity},${i.currentPrice * i.quantity}\n`;
      });
      csvContent += "\n";
    }

    // Accounts
    if (exportSections.accounts) {
      csvContent += "SECTION: ACCOUNTS\n";
      csvContent += "Name,Nickname,Type,Balance/Outstanding\n";
      data.accounts.forEach(a => csvContent += `${a.name},${a.nickname || ''},Bank,${a.balance}\n`);
      data.creditCards.forEach(c => csvContent += `${c.name},${c.nickname || ''},Credit Card,${c.outstanding}\n`);
      data.wallets.forEach(w => csvContent += `${w.name},${w.nickname || ''},Wallet,${w.balance}\n`);
      csvContent += "\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinTrack_Export_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <FileDown size={180} />
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Export & Reports</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Download your financial data for offline use or generate a PDF report.</p>

        <div className="space-y-8">
          {/* Date Range Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block flex items-center gap-2">
                <Calendar size={12} className="text-blue-500" /> Start Date
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block flex items-center gap-2">
                <Calendar size={12} className="text-blue-500" /> End Date
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Section Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ExportChip 
              label="Transactions" 
              active={exportSections.transactions} 
              onClick={() => setExportSections(prev => ({...prev, transactions: !prev.transactions}))} 
              icon={<Download size={14} />}
            />
            <ExportChip 
              label="Investments" 
              active={exportSections.investments} 
              onClick={() => setExportSections(prev => ({...prev, investments: !prev.investments}))} 
              icon={<TrendingUp size={14} />}
            />
            <ExportChip 
              label="Budgets" 
              active={exportSections.budgets} 
              onClick={() => setExportSections(prev => ({...prev, budgets: !prev.budgets}))} 
              icon={<PieChart size={14} />}
            />
            <ExportChip 
              label="Accounts" 
              active={exportSections.accounts} 
              onClick={() => setExportSections(prev => ({...prev, accounts: !prev.accounts}))} 
              icon={<Briefcase size={14} />}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={generateCSV}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50"
            >
              {isExporting ? <CheckCircle2 size={24} className="animate-bounce" /> : <FileText size={24} />}
              Export as CSV
            </button>
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-500/20"
            >
              <Printer size={24} />
              Print PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Print-Only View */}
      <div className="hidden print:block fixed inset-0 z-[1000] bg-white p-10 text-slate-900">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">FinTrack Financial Report</h1>
            <p className="text-slate-500 font-bold mt-2">Generated for: {data.profile?.name || 'User'}</p>
            <p className="text-slate-400 text-xs">Period: {startDate} to {endDate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Confidential</p>
            <p className="text-xs font-bold text-slate-900 mt-1">{new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-12">
          {exportSections.transactions && (
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b border-slate-200 pb-2">Recent Transactions</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2">Date</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.transactions
                    .filter(t => filterByDate(t.date))
                    .slice(0, 50)
                    .map(t => (
                      <tr key={t.id}>
                        <td className="py-2 font-medium">{t.date}</td>
                        <td className="py-2 font-bold uppercase text-[10px]">{t.type}</td>
                        <td className="py-2">{t.subCategory}</td>
                        <td className="py-2 font-black">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <p className="text-[10px] text-slate-400 mt-4 font-bold italic">Showing up to 50 most recent entries in the selected range.</p>
            </section>
          )}

          {exportSections.accounts && (
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b border-slate-200 pb-2">Account Balances</h2>
              <div className="grid grid-cols-2 gap-8">
                {data.accounts.map(a => (
                  <div key={a.id} className="flex justify-between border-b border-slate-50 py-2">
                    <span className="font-bold text-slate-600">{a.nickname || a.name}</span>
                    <span className="font-black">{formatCurrency(a.balance)}</span>
                  </div>
                ))}
                {data.creditCards.map(c => (
                  <div key={c.id} className="flex justify-between border-b border-slate-50 py-2">
                    <span className="font-bold text-slate-600">{c.nickname || c.name} (Debt)</span>
                    <span className="font-black text-rose-600">{formatCurrency(c.outstanding)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">This report was generated using FinTrack Pro v5.1.0</p>
        </div>
      </div>
    </div>
  );
};

const ExportChip = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default ExportManager;
