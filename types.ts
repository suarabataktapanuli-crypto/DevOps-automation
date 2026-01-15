
export enum WorkerStatus {
  IDLE = 'Idle',
  FETCHING = 'Fetching',
  PROCESSING = 'Processing',
  SUCCESS = 'Success',
  FAILED = 'Failed'
}

export interface ScrapeJob {
  id: string;
  url: string;
  status: WorkerStatus;
  title?: string;
  error?: string;
  timestamp: number;
  duration?: number;
}

export interface HealthStats {
  activeWorkers: number;
  maxWorkers: number;
  throughput: number; // PPM (Pages Per Minute)
  successRate: number;
}

export interface LogEntry {
  id: string;
  workerId: number;
  message: string;
  type: 'info' | 'error' | 'success';
  timestamp: string;
}
