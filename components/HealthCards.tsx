
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ICONS } from '../constants';
import { HealthStats } from '../types';

const data = [
  { name: '1', val: 400 },
  { name: '2', val: 450 },
  { name: '3', val: 420 },
  { name: '4', val: 480 },
  { name: '5', val: 440 },
  { name: '6', val: 460 },
  { name: '7', val: 450 },
];

const HealthCards: React.FC<{ stats: HealthStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Workers Card */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between group hover:border-blue-500/50 transition-colors">
        <div>
          <p className="text-sm text-slate-400 mb-1">Goroutines Active</p>
          <h3 className="text-3xl font-bold text-white font-mono">{stats.activeWorkers}<span className="text-slate-500 text-xl font-normal ml-1">/{stats.maxWorkers}</span></h3>
          <div className="mt-2 text-[10px] text-blue-400 font-mono tracking-tighter">WAIT_GROUP.DONE() STATUS: OK</div>
        </div>
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="pulse-icon group-hover:scale-110 transition-transform"><ICONS.Radio /></div>
        </div>
      </div>

      {/* Throughput Card */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl group hover:border-emerald-500/50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Throughput</p>
            <h3 className="text-3xl font-bold text-white font-mono">{stats.throughput} <span className="text-slate-500 text-xl font-medium">PPM</span></h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              +12.4% vs Sequential
            </p>
          </div>
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Success Rate Card */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-6 group hover:border-sky-500/50 transition-colors">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="28" fill="transparent" stroke="#334155" strokeWidth="8" />
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              fill="transparent" 
              stroke="#0ea5e9" 
              strokeWidth="8" 
              strokeDasharray={176} 
              strokeDashoffset={176 - (176 * stats.successRate) / 100} 
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-xs font-bold font-mono">{stats.successRate}%</span>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">Worker Stability</p>
          <h3 className="text-xl font-bold text-white">context.Done()</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1">NO_PANICS_DETECTED</p>
        </div>
      </div>
    </div>
  );
};

export default HealthCards;
