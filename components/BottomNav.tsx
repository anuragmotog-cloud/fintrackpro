import React from 'react';
import { View } from '../types';
import { NAVIGATION_ITEMS } from '../constants';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl flex items-center gap-1 p-2 max-w-full overflow-x-auto no-scrollbar pointer-events-auto ring-1 ring-black/5 dark:ring-white/5">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`flex flex-col items-center gap-1 min-w-[70px] lg:min-w-[80px] py-2 px-1 rounded-[1.8rem] transition-all ${
              currentView === item.id
                ? 'text-blue-600 dark:text-[#39FF14] bg-blue-50 dark:bg-[#39FF14]/10 shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`p-1.5 transition-all ${
              currentView === item.id ? 'scale-110' : ''
            }`}>
              {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 22 })}
            </div>
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-wider">{item.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;