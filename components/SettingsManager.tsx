
import React, { useState } from 'react';
import { NotificationPreferences } from '../types';
import { Bell, ShieldCheck, AlertTriangle, Landmark, PieChart, ChevronRight, Save, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface SettingsManagerProps {
  preferences: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ preferences, onSave }) => {
  const [formData, setFormData] = useState<NotificationPreferences>({ ...preferences });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: keyof NotificationPreferences) => {
    if (typeof formData[key] === 'boolean') {
      setFormData({ ...formData, [key]: !formData[key] });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Bell size={180} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Notification Control</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Customize how and when you want to be alerted about your finances.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ToggleOption 
                icon={<PieChart size={20} />} 
                title="Budget Warnings" 
                description="Get notified when you reach 90% of your monthly budget limits." 
                active={formData.budgetWarnings} 
                onToggle={() => toggle('budgetWarnings')}
                color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
            />
            
            <ToggleOption 
                icon={<AlertTriangle size={20} />} 
                title="EMI Reminders" 
                description="Receive a reminder on the morning of your loan repayment due dates." 
                active={formData.emiReminders} 
                onToggle={() => toggle('emiReminders')}
                color="text-amber-500 bg-amber-50 dark:bg-amber-900/20"
            />

            <div className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                <ToggleOption 
                    icon={<Landmark size={20} />} 
                    title="Low Balance Alerts" 
                    description="Trigger an alert if any bank account falls below your defined threshold." 
                    active={formData.lowBalanceAlerts} 
                    onToggle={() => toggle('lowBalanceAlerts')}
                    color="text-rose-500 bg-rose-50 dark:bg-rose-900/20"
                    noBorder
                />
                
                {formData.lowBalanceAlerts && (
                    <div className="pl-14 animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Threshold Amount (₹)</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="1000" 
                                max="50000" 
                                step="1000"
                                value={formData.lowBalanceThreshold}
                                onChange={(e) => setFormData({ ...formData, lowBalanceThreshold: parseInt(e.target.value) })}
                                className="flex-1 accent-[#39FF14]"
                            />
                            <span className="text-sm font-black text-slate-900 dark:text-white min-w-[100px] text-right">
                                {formatCurrency(formData.lowBalanceThreshold)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 text-slate-400">
                  <ShieldCheck size={20} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Global preferences are saved locally</p>
               </div>
               
               <button 
                type="submit"
                disabled={saved}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 dark:bg-[#39FF14] text-white dark:text-slate-950 shadow-xl dark:shadow-[#39FF14]/20'}`}
               >
                 {saved ? <><CheckCircle2 size={20} /> Preferences Updated</> : <><Save size={20} /> Save Settings</>}
               </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-blue-600 p-8 lg:p-10 rounded-[2.5rem] shadow-xl shadow-blue-500/20 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
         <div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Financial Integrity</h3>
            <p className="text-blue-100 text-sm font-medium opacity-80">Settings applied here affect the entire FinTrack ecosystem.</p>
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
            System V5.1.0 Active
         </div>
      </div>
    </div>
  );
};

interface ToggleOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    active: boolean;
    onToggle: () => void;
    color: string;
    noBorder?: boolean;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({ icon, title, description, active, onToggle, color, noBorder }) => (
    <div className={`flex items-start justify-between gap-6 ${noBorder ? '' : 'p-6 rounded-3xl border border-slate-100 dark:border-slate-800'}`}>
        <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                {icon}
            </div>
            <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
            </div>
        </div>
        
        <button 
            type="button"
            onClick={onToggle}
            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative shrink-0 ${active ? 'bg-[#39FF14]' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
            <div className={`w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md transition-all duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
    </div>
);

export default SettingsManager;
