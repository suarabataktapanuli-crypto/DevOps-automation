
import React from 'react';
import { ICONS } from '../constants';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="w-64 bg-[#0f172a] h-screen flex flex-col border-r border-slate-800">
      <div className="p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black tracking-tighter text-sm shrink-0 shadow-lg shadow-blue-500/20">BH</div>
            <h1 className="text-sm font-bold text-white truncate leading-tight">Bambang<br/>Hutagalung</h1>
          </div>
          <p className="text-[10px] font-mono text-blue-400/80 mt-2 uppercase tracking-tighter border-t border-slate-800 pt-2">
            Concurrent Web Scraper
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-2">Main Menu</p>
        <SidebarItem 
          icon={<ICONS.Home />} 
          label="Dashboard: Concurrent Web Scraper" 
          active={activeView === 'dashboard'} 
          onClick={() => onViewChange('dashboard')}
        />
        <SidebarItem 
          icon={<ICONS.History />} 
          label="Crawler Logs" 
          active={activeView === 'logs'} 
          onClick={() => onViewChange('logs')}
        />
        <SidebarItem 
          icon={<ICONS.Settings />} 
          label="Settings" 
          active={activeView === 'settings'} 
          onClick={() => onViewChange('settings')}
        />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Current Workspace</p>
          <select className="bg-transparent text-sm font-medium w-full outline-none cursor-pointer text-slate-300">
            <option>Primary Cluster</option>
            <option>Beta Crawler</option>
            <option>Archive Nodes</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${active ? 'bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
  >
    <div className={`${active ? 'text-blue-400' : 'text-slate-500'}`}>{icon}</div>
    <span className="text-xs font-medium leading-tight">{label}</span>
  </div>
);

export default Sidebar;
