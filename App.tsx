
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import HealthCards from './components/HealthCards';
import StreamingTable from './components/StreamingTable';
import Terminal from './components/Terminal';
import GoroutineMap from './components/GoroutineMap';
import { WorkerStatus, ScrapeJob, HealthStats, LogEntry } from './types';
import { SITES, TITLES, ERRORS, ICONS } from './constants';

const MAX_WORKERS = 40; 

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [extractMode, setExtractMode] = useState('SEO_TITLE');
  const [customSelectors, setCustomSelectors] = useState('');
  
  const [stats, setStats] = useState<HealthStats>({
    activeWorkers: 0,
    maxWorkers: MAX_WORKERS,
    throughput: 0,
    successRate: 0
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addLog = useCallback((workerId: number | string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      workerId: typeof workerId === 'number' ? workerId : 0,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLogs(prev => [...prev.slice(-200), newLog]);
  }, []);

  const generateMockData = (mode: string, custom: string) => {
    switch (mode) {
      case 'SEO_TITLE':
        return TITLES[Math.floor(Math.random() * TITLES.length)];
      case 'META_DESC':
        return `description: "Explore the latest in ${TITLES[Math.floor(Math.random() * TITLES.length)]}", robots: "index, follow"`;
      case 'LD_JSON':
        return `{"@context": "https://schema.org", "@type": "NewsArticle", "headline": "${TITLES[Math.floor(Math.random() * TITLES.length)]}"}`;
      case 'H_TAGS':
        return `H1: Main Content Header | H2: Sub-section | H2: Key Takeaways`;
      case 'LINKS':
        return `https://example.com/ref-${Math.floor(Math.random()*100)}, https://cdn.site.com/assets/img.png`;
      case 'CUSTOM':
        return `MATCHED_NODES: Found ${Math.floor(Math.random()*5)+1} elements matching "${custom || '.default'}"`;
      default:
        return "No specific data extracted.";
    }
  };

  const spawnGoroutine = useCallback(async (jobId: string, mode: string) => {
    const workerId = 100 + Math.floor(Math.random() * 900);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: WorkerStatus.FETCHING } : j));
    
    addLog(workerId, `Establishing TCP handshake with target...`, 'info');
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: WorkerStatus.PROCESSING } : j));
    addLog(workerId, `Querying schema: [${mode}]`, 'info');
    
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));

    const isFail = Math.random() < 0.12;
    if (isFail) {
      const err = ERRORS[Math.floor(Math.random() * ERRORS.length)];
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: WorkerStatus.FAILED, error: err } : j));
      addLog(workerId, `Channel Error: ${err}`, 'error');
    } else {
      const extractedContent = generateMockData(mode, customSelectors);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: WorkerStatus.SUCCESS, title: extractedContent } : j));
      addLog(workerId, `Success: Buffer sync completed for ${mode}.`, 'success');
    }
  }, [addLog, customSelectors]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const active = jobs.filter(j => j.status === WorkerStatus.FETCHING || j.status === WorkerStatus.PROCESSING).length;
        const totalProcessed = jobs.filter(j => j.status === WorkerStatus.SUCCESS || j.status === WorkerStatus.FAILED).length;
        const success = jobs.filter(j => j.status === WorkerStatus.SUCCESS).length;
        return {
          ...prev,
          activeWorkers: active,
          throughput: active > 0 ? Math.floor(600 + Math.random() * 120) : 0,
          successRate: totalProcessed > 0 ? Math.round((success / totalProcessed) * 100) : 0
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [jobs]);

  const handleAddUrls = (e: React.FormEvent) => {
    e.preventDefault();
    const rawUrls = urlInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0);
    const validUrls = rawUrls.map(url => url.startsWith('http') ? url : `https://${url}`);
    if (validUrls.length > 0) {
      const newJobs: ScrapeJob[] = validUrls.map(url => ({
        id: Math.random().toString(36).substr(2, 9),
        url: url,
        status: WorkerStatus.IDLE,
        timestamp: Date.now()
      }));
      setJobs(prev => [...newJobs, ...prev].slice(0, 100));
      setUrlInput('');
      newJobs.forEach(j => spawnGoroutine(j.id, extractMode));
    }
  };

  const downloadResults = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bh_scraper_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const renderContent = () => {
    switch(activeView) {
      case 'logs':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ICONS.History /> System Event Stream
              </h3>
              <button 
                onClick={() => setLogs([])}
                className="text-xs text-slate-500 hover:text-rose-400 font-mono border border-slate-800 px-3 py-1 rounded-lg hover:bg-rose-500/5 transition-all"
              >
                Flush Runtime Logs
              </button>
            </div>
            <Terminal logs={logs} />
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <section className="bg-[#1e293b] rounded-2xl border border-slate-800 p-8 shadow-2xl">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-400">
                <ICONS.Settings /> Concurrency Configuration
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-sm font-medium text-slate-200">Max Parallel Workers</label>
                    <p className="text-xs text-slate-500">System threads allocated for concurrent processing.</p>
                  </div>
                  <input type="number" defaultValue={MAX_WORKERS} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 w-24 text-center font-mono focus:border-blue-500 outline-none text-blue-400 font-bold" />
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Ingestion Panel */}
              <div className="lg:col-span-3">
                <section className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </div>
                      Worker Ingestion Control
                    </h3>
                  </div>

                  <form onSubmit={handleAddUrls} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: URLs */}
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-tighter block ml-1">1. Target Endpoints (URLs)</label>
                        <textarea 
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="google.com&#10;github.com/trending"
                          className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none font-mono"
                        />
                      </div>

                      {/* Right: Extraction Schema */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-tighter block ml-1">2. Extraction Directive</label>
                          <select 
                            value={extractMode}
                            onChange={(e) => setExtractMode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-blue-500 transition-all"
                          >
                            <option value="SEO_TITLE">Global Page Title (SEO)</option>
                            <option value="META_DESC">Meta Descriptions & Keywords</option>
                            <option value="LD_JSON">Structured Data (LD+JSON)</option>
                            <option value="H_TAGS">Header Hierarchy (H1-H3)</option>
                            <option value="LINKS">All External Hyperlinks</option>
                            <option value="CUSTOM">Custom CSS/XPath Selectors</option>
                          </select>
                        </div>

                        {extractMode === 'CUSTOM' && (
                          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                             <input 
                              type="text"
                              value={customSelectors}
                              onChange={(e) => setCustomSelectors(e.target.value)}
                              placeholder="e.g. .product-title, #price-tag"
                              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-blue-400 font-mono focus:outline-none"
                             />
                             <p className="text-[10px] text-slate-500 font-mono pl-1">ENTER_VALID_DOM_SELECTORS</p>
                          </div>
                        )}

                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 mt-2">
                          <p className="text-[10px] text-slate-500 font-mono mb-2">EXTRACTION_POLICY</p>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="headless" defaultChecked className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                            <label htmlFor="headless" className="text-xs text-slate-400">Headless Execution</label>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <input type="checkbox" id="js" className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                            <label htmlFor="js" className="text-xs text-slate-400">Evaluate Dynamic JS</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                      <button type="button" onClick={() => setUrlInput('')} className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all border border-slate-700 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400">Clear</button>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        Initialize Channels
                      </button>
                    </div>
                  </form>
                </section>
              </div>

              {/* Status Panel */}
              <div className="lg:col-span-1">
                <GoroutineMap jobs={jobs} maxWorkers={MAX_WORKERS} />
              </div>
            </div>

            <HealthCards stats={stats} />
            <StreamingTable 
              jobs={jobs} 
              onRetry={() => {}} 
              onClearResults={() => setJobs([])} 
            />
            <Terminal logs={logs.slice(-15)} />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-200 bg-[#0b0f1a]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="px-10 py-6 flex justify-between items-center border-b border-slate-800 bg-[#0b0f1a]/80 backdrop-blur-xl sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-bold tracking-tight capitalize flex items-center gap-2">
              {activeView === 'dashboard' ? 'Dashboard: Concurrent Web Scraper' : activeView}
            </h2>
            <p className="text-slate-500 text-xs font-mono mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              BH_CORE_ENGINE_V1.22 // WORKER_ID: 0x{Math.floor(Math.random()*1000).toString(16)}
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 leading-none mb-1 uppercase tracking-tighter">CPU_LOAD</p>
                <p className="text-xs font-mono text-blue-400 font-bold">12.4%</p>
              </div>
              <div className="w-px h-6 bg-slate-800"></div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 leading-none mb-1 uppercase tracking-tighter">MEM_USAGE</p>
                <p className="text-xs font-mono text-emerald-400 font-bold">42MB</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
