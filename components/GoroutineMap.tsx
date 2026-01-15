
import React from 'react';
import { WorkerStatus, ScrapeJob } from '../types';

interface GoroutineMapProps {
  jobs: ScrapeJob[];
  maxWorkers: number;
}

const GoroutineMap: React.FC<GoroutineMapProps> = ({ jobs, maxWorkers }) => {
  const activeJobs = jobs.filter(j => j.status === WorkerStatus.FETCHING || j.status === WorkerStatus.PROCESSING);
  
  return (
    <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          Worker Pool Topology
        </h3>
        <span className="text-[10px] font-mono text-slate-500">SCHED_GO_MAXPROCS: {maxWorkers}</span>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: maxWorkers }).map((_, i) => {
          const isActive = i < activeJobs.length;
          return (
            <div 
              key={i}
              className={`h-6 rounded-sm border transition-all duration-500 ${
                isActive 
                  ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] scale-105' 
                  : 'bg-slate-900 border-slate-800'
              }`}
              title={isActive ? `Worker ${i+1}: Active` : `Worker ${i+1}: Idle`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 text-[10px] font-mono">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> BUSY</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-800 rounded-full"></span> IDLE</div>
      </div>
    </div>
  );
};

export default GoroutineMap;
