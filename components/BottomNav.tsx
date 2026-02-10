
import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';
import { NAVIGATION_ITEMS } from '../constants';
import { X, ChevronRight, LayoutGrid } from 'lucide-react';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active item into view in the horizontal dock
  useEffect(() => {
    if (!isMenuOpen) {
      const activeElement = scrollRef.current?.querySelector(`[data-active="true"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentView, isMenuOpen]);

  const handleItemClick = (viewId: View) => {
    onViewChange(viewId);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Vertical Pop-up Command Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col justify-end pb-32 px-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="w-full max-w-lg mx-auto bg-white/10 dark:bg-slate-900/40 border border-white/10 dark:border-slate-800/50 rounded-[3rem] p-4 shadow-2xl animate-in slide-in-from-bottom-12 duration-500 ease-out flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 mb-2 border-b border-white/5">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Master Navigation</span>
               <button 
                 onClick={() => setIsMenuOpen(false)} 
                 className="p-2 bg-rose-500/20 text-rose-500 rounded-full hover:bg-rose-500 transition-all hover:text-white"
               >
                  <X size={20} />
               </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar space-y-2 pb-2">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id as View)}
                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all group active:scale-[0.97] ${
                      isActive 
                        ? 'bg-[#39FF14] text-slate-950 shadow-xl shadow-[#39FF14]/20' 
                        : 'bg-white/5 dark:bg-slate-800/30 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-slate-950/10' 
                          : 'bg-slate-900 border border-white/5 group-hover:border-[#39FF14]/30'
                      }`}>
                        {/* Fix: Added strokeWidth to the type cast for React.cloneElement to prevent TS error */}
                        {React.cloneElement(item.icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { 
                          size: 20,
                          strokeWidth: isActive ? 3 : 2
                        })}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black uppercase tracking-widest block">{item.name}</span>
                        {!isActive && <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">Access {item.name.toLowerCase()} stream</span>}
                      </div>
                    </div>
                    <ChevronRight size={18} className={isActive ? 'text-slate-950/30' : 'text-slate-600 group-hover:translate-x-1 transition-transform'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Liquid Dock Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[160] flex justify-center pb-8 px-4 pointer-events-none">
        <div className="relative w-full max-w-lg pointer-events-auto">
          {/* Horizontal Dock */}
          <div 
            ref={scrollRef}
            className={`bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] flex items-center gap-1 p-2 overflow-x-auto no-scrollbar scroll-smooth ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 ${
              isMenuOpen ? 'scale-105 border-[#39FF14]/30 ring-[#39FF14]/20' : ''
            }`}
          >
            {/* FinTrack Master Toggle Button */}
            <button
              data-active={currentView === View.Dashboard || isMenuOpen}
              onClick={toggleMenu}
              className={`flex flex-col items-center justify-center flex-shrink-0 min-w-[84px] py-2 px-1 rounded-[2rem] transition-all duration-300 relative ${
                isMenuOpen || currentView === View.Dashboard
                  ? 'text-slate-900 dark:text-[#39FF14]'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {/* Active Glow Background */}
              <div className={`absolute inset-0 m-1 rounded-[1.8rem] transition-all duration-300 ${
                isMenuOpen || currentView === View.Dashboard ? 'bg-[#39FF14]/15 dark:bg-[#39FF14]/10' : 'bg-transparent'
              }`} />
              
              <div className={`p-2.5 rounded-xl transition-all duration-300 z-10 ${
                isMenuOpen ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' : 
                currentView === View.Dashboard ? 'bg-[#39FF14] text-slate-900 shadow-[0_0_20px_rgba(57,255,20,0.5)] scale-110' : 'bg-transparent'
              }`}>
                {isMenuOpen ? <X size={22} strokeWidth={3} /> : <LayoutGrid size={22} strokeWidth={currentView === View.Dashboard ? 3 : 2} />}
              </div>
              
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1 z-10 ${
                isMenuOpen ? 'text-rose-500' : 
                currentView === View.Dashboard ? 'text-slate-900 dark:text-[#39FF14]' : 'text-slate-400'
              }`}>
                {isMenuOpen ? 'Close' : 'Menu'}
              </span>
            </button>

            {/* Horizontal Sub-Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {NAVIGATION_ITEMS.filter(item => item.id !== View.Dashboard).map((item) => {
                const isActive = currentView === item.id && !isMenuOpen;
                return (
                  <button
                    key={item.id}
                    data-active={isActive}
                    onClick={() => handleItemClick(item.id as View)}
                    className={`flex flex-col items-center justify-center flex-shrink-0 min-w-[72px] py-2 px-1 rounded-[2rem] transition-all duration-300 relative ${
                      isActive
                        ? 'text-slate-900 dark:text-[#39FF14]'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
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
                    
                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 z-10 ${
                      isActive ? 'text-slate-900 dark:text-[#39FF14]' : 'text-slate-400'
                    }`}>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
