
import React from 'react';
import { View } from '../types';
import { NAVIGATION_ITEMS } from '../constants';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
  return (
    <div className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col h-screen sticky top-0 transition-all duration-300">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20">F</div>
        <h1 className="text-xl font-black tracking-tighter uppercase">FinTrack Pro</h1>
      </div>
      
      <nav className="flex-1 px-4 py-8">
        <ul className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id as View)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-sm tracking-wide">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-800/50 space-y-4">
        <div className="bg-slate-800/40 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-3">Cloud Sync</p>
          <div className="h-1.5 bg-slate-700 rounded-full mb-2">
            <div className="h-full bg-blue-500 rounded-full w-[85%]"></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">Active • Last sync 2m ago</p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={20} />
          <span className="text-sm tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
