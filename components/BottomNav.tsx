
import React, { useRef, useEffect } from 'react';
import { View } from '../types';
import { NAVIGATION_ITEMS } from '../constants';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active item into view in the horizontal dock
  useEffect(() => {
    const activeElement = scrollRef.current?.querySelector(`[data-active="true"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentView]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pb-8 px-4 pointer-events-none">
      <div className="relative w-full max-w-lg pointer-events-auto">
        {/* Horizontal Dock */}
        <div 
          ref={scrollRef}
          className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex items-center gap-1 p-2 overflow-x-auto no-scrollbar scroll-smooth ring-1 ring-black/5 dark:ring-white/5"
        >
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                data-active={isActive}
                onClick={() => onViewChange(item.id as View)}
                className={`flex flex-col items-center justify-center flex-shrink-0 min-w-[76px] py-2 px-1 rounded-[2rem] transition-all duration-300 relative ${
                  isActive
                    ? 'text-slate-900 dark:text-[#39FF14]'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {/* Active Glow Background */}
                <div className={`absolute inset-0 m-1 rounded-[1.8rem] transition-all duration-300 ${
                  isActive ? 'bg-[#39FF14]/15 dark:bg-[#39FF14]/10' : 'bg-transparent'
                }`} />
                
                <div className={`p-2 rounded-xl transition-all duration-300 z-10 ${
                  isActive ? 'bg-[#39FF14] text-slate-900 shadow-[0_0_15px_rgba(57,255,20,0.4)] scale-110' : 'bg-transparent'
                }`}>
                  {React.cloneElement(item.icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { 
                    size: 20,
                    strokeWidth: isActive ? 3 : 2
                  })}
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 z-10 transition-colors duration-300 ${
                  isActive ? 'text-slate-900 dark:text-[#39FF14]' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Edge Fade Indicators for Mobile Scrolling */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 rounded-l-[2.5rem] pointer-events-none sm:hidden"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 rounded-r-[2.5rem] pointer-events-none sm:hidden"></div>
      </div>
    </nav>
  );
};

export default BottomNav;
