
import React, { useState } from 'react';
import { WorkerStatus, ScrapeJob } from '../types';
import { ICONS } from '../constants';

const StatusBadge: React.FC<{ status: WorkerStatus }> = ({ status }) => {
  const colors = {
    [WorkerStatus.IDLE]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    [WorkerStatus.FETCHING]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    [WorkerStatus.PROCESSING]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [WorkerStatus.SUCCESS]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    [WorkerStatus.FAILED]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const dotColors = {
    [WorkerStatus.IDLE]: 'bg-slate-500',
    [WorkerStatus.FETCHING]: 'bg-blue-500 animate-pulse',
    [WorkerStatus.PROCESSING]: 'bg-amber-500 animate-spin',
    [WorkerStatus.SUCCESS]: 'bg-emerald-500',
    [WorkerStatus.FAILED]: 'bg-rose-500',
  };

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
      {status}
    </span>
  );
};

interface StreamingTableProps {
  jobs: ScrapeJob[];
  onRetry: () => void;
  onClearResults: () => void;
}

const StreamingTable: React.FC<StreamingTableProps> = ({ jobs, onRetry, onClearResults }) => {
  const [selectedJob, setSelectedJob] = useState<ScrapeJob | null>(null);

  const closePreview = () => setSelectedJob(null);

  // Helper to parse the job title into the "Name/Value" format seen in the screenshot
  const getCapturedRows = (job: ScrapeJob) => {
    if (!job.title) return [];
    
    // Simulating multiple field extraction for different modes
    if (job.title.includes('|')) {
      return job.title.split('|').map((part, idx) => {
        const [name, value] = part.split(':').map(s => s.trim());
        return { name: name || `captured_${idx+1}`, value: value || part };
      });
    }

    if (job.title.startsWith('{')) {
       try {
         const obj = JSON.parse(job.title);
         return Object.entries(obj).map(([k, v]) => ({ name: k, value: String(v) }));
       } catch {
         return [{ name: "data_buffer", value: job.title }];
       }
    }

    // Default mapping for simple strings (like titles)
    return [
      { name: "nama halaman", value: job.title.toUpperCase() },
      { name: "halaman", value: `<li class="wp-block-navigation-item">... ${job.title.substring(0, 30)}</li>` }
    ];
  };

  return (
    <>
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px] relative">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <div className="flex gap-6">
            <button className="text-sm font-semibold border-b-2 border-blue-500 pb-1">Live Feed</button>
            <button className="text-sm font-medium text-slate-500 pb-1">Streaming Table</button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClearResults}
              disabled={jobs.length === 0}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border border-slate-700 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              Clear Results
            </button>
            <button 
              onClick={onRetry}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-lg active:scale-95"
            >
              Retry All Failed
            </button>
          </div>
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#1e293b] shadow-sm z-10">
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">URL</th>
                <th className="px-6 py-4 font-semibold">Title / Data</th>
                <th className="px-6 py-4 font-semibold text-center">Preview</th>
                <th className="px-6 py-4 font-semibold text-center">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id} className={`group hover:bg-white/5 transition-colors ${job.status === WorkerStatus.FAILED ? 'bg-rose-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-300 truncate max-w-xs">{job.url}</p>
                    </td>
                    <td className="px-6 py-4">
                      {job.status === WorkerStatus.FAILED ? (
                        <span className="text-xs text-rose-400 font-medium">Error: {job.error}</span>
                      ) : (
                        <span className="text-sm text-slate-400 truncate block max-w-sm italic">
                          {job.title || (job.status === WorkerStatus.FETCHING ? 'Establishing connection...' : 'Parsing DOM...')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className={`p-1.5 rounded-lg transition-all ${selectedJob?.id === job.id ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-blue-400 hover:bg-blue-400/10'}`}
                        title="Preview Live Data"
                      >
                        <ICONS.Search />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 transition-all">
                        <ICONS.More />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                    No active jobs. Ingest some URLs to begin scraping.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redesigned Preview Modal matching the Screenshot */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={closePreview}>
          <div 
            className="bg-[#1e2532] border border-slate-700 w-full max-w-4xl rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between bg-[#2d3748]/30">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-tight">Output Data Preview</h4>
              </div>
              <button onClick={closePreview} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            {/* Content Tabs */}
            <div className="px-6 pt-6">
              <div className="flex border-b border-slate-700/50">
                <div className="px-8 py-3 bg-[#2d3748]/50 border-t border-x border-slate-600 rounded-t-lg text-sm text-slate-100 font-medium">
                  Captured Texts
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-200">New Captures</span>
              </div>
              
              <div className="bg-[#1a202c]/60 rounded border border-slate-700/50 min-h-[300px]">
                {selectedJob.status === WorkerStatus.SUCCESS ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="px-6 py-3 text-xs font-bold text-slate-300 w-16">#</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-300 w-1/3">Name</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-300">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {getCapturedRows(selectedJob).map((row, i) => (
                        <tr key={i} className="hover:bg-blue-500/5 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-200">{row.name}</td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : selectedJob.status === WorkerStatus.FAILED ? (
                  <div className="p-8 text-rose-400 font-mono text-xs">
                    <span className="font-bold block mb-2">[CRITICAL_ERROR]</span>
                    <p>{selectedJob.error || 'Connection timed out.'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="text-xs text-slate-500 font-mono">SYNCHRONIZING_CAPTURE_STREAM...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#1a202c] border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              <div>Job_Status: {selectedJob.status} // Source: {selectedJob.url}</div>
              <div className="text-blue-400">BH_ENGINE_PREVIEW_ACTIVE</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StreamingTable;
