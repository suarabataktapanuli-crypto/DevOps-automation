
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

const Terminal: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden mt-8">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Runtime logs</span>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-emerald-500/80 font-mono uppercase tracking-tighter">Go 1.22.4</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <div className="w-2 h-2 rounded-full bg-slate-700" />
        </div>
      </div>
      <div 
        ref={terminalRef}
        className="p-4 h-56 overflow-auto mono text-[11px] leading-relaxed scroll-smooth"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-4 py-0.5 group border-l border-transparent hover:border-slate-800 pl-2">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`${
               log.workerId === 0 ? 'text-blue-400' : 'text-blue-500'
            } shrink-0 font-bold min-w-[75px]`}>
              {log.workerId === 0 ? 'RUNTIME' : `G#${log.workerId}`}
            </span>
            <span className="text-slate-700 shrink-0">::</span>
            <span className={`flex-1 ${
              log.type === 'error' ? 'text-rose-400' : 
              log.type === 'success' ? 'text-emerald-400' : 
              'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-slate-700 italic">Awaiting channel data...</div>}
        <div className="mt-2 animate-pulse text-cyan-500">_</div>
      </div>
    </div>
  );
};

export default Terminal;
