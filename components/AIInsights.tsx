
import React from 'react';
import { FinancialInsight } from '../services/geminiService';
import { Sparkles, TrendingUp, ShieldAlert, Target, Zap, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  insights: FinancialInsight[];
  loading: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-900/50 dark:bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
        <Loader2 size={32} className="text-[#39FF14] animate-spin" />
        <div>
          <p className="text-white font-black uppercase tracking-widest text-xs">Gemini AI Analysis</p>
          <p className="text-slate-400 text-[10px] font-bold">Scanning your cash flow and portfolio...</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case 'savings': return <Target size={20} className="text-[#39FF14]" />;
      case 'investment': return <TrendingUp size={20} className="text-blue-400" />;
      case 'alert': return <ShieldAlert size={20} className="text-rose-400" />;
      case 'business': return <Zap size={20} className="text-amber-400" />;
      default: return <Sparkles size={20} />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low': return 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-2 mb-2 px-2">
        <Sparkles size={16} className="text-[#39FF14]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Intelligent Advisor Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white dark:bg-slate-900/60 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-[#39FF14]/30 transition-all shadow-sm hover:shadow-xl hover:shadow-[#39FF14]/5 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              {getIcon(insight.category)}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-50 dark:bg-white/5`}>
                {getIcon(insight.category)}
              </div>
              <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getImpactColor(insight.impact)}`}>
                {insight.impact} Impact
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 leading-tight">
              {insight.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
