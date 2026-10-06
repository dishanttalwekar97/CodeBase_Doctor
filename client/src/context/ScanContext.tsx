import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ConnectedRepo, Scan } from '../types';
import { repoService, scanService } from '../services/api';

interface ScanContextType {
  repos: ConnectedRepo[];
  selectedRepo: ConnectedRepo | null;
  currentScan: Scan | null;
  loadingRepos: boolean;
  scanning: boolean;
  statusLogs: string[];
  progressPercent: number;
  selectRepo: (repo: ConnectedRepo) => void;
  fetchRepos: () => Promise<void>;
  triggerScan: (repoUrl?: string, repoId?: string) => Promise<Scan | null>;
  connectNewRepo: (url: string) => Promise<ConnectedRepo | null>;
  loadScanDetails: (scanId: string) => Promise<void>;
}

const ScanContext = createContext<ScanContextType>({
  repos: [],
  selectedRepo: null,
  currentScan: null,
  loadingRepos: true,
  scanning: false,
  statusLogs: [],
  progressPercent: 0,
  selectRepo: () => {},
  fetchRepos: async () => {},
  triggerScan: async () => null,
  connectNewRepo: async () => null,
  loadScanDetails: async () => {}
});

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [repos, setRepos] = useState<ConnectedRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<ConnectedRepo | null>(null);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const data = await repoService.getRepos();
      setRepos(data);

      if (data.length > 0 && !selectedRepo) {
        setSelectedRepo(data[0]);
        if (data[0].scans && data[0].scans.length > 0) {
          // Fetch full scan details including issues
          const fullScan = await scanService.getScanDetails(data[0].scans[0].id);
          setCurrentScan(fullScan);
        }
      }
    } catch (err) {
      console.error('Failed to fetch repos:', err);
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const selectRepo = async (repo: ConnectedRepo) => {
    setSelectedRepo(repo);
    if (repo.scans && repo.scans.length > 0) {
      try {
        const fullScan = await scanService.getScanDetails(repo.scans[0].id);
        setCurrentScan(fullScan);
      } catch (err) {
        console.error('Failed to load scan details:', err);
      }
    } else {
      setCurrentScan(null);
    }
  };

  const loadScanDetails = async (scanId: string) => {
    try {
      const fullScan = await scanService.getScanDetails(scanId);
      setCurrentScan(fullScan);
    } catch (err) {
      console.error('Failed to load scan:', err);
    }
  };

  const triggerScan = async (repoUrl?: string, repoId?: string): Promise<Scan | null> => {
    setScanning(true);
    setProgressPercent(2);
    setStatusLogs(['[Engine] Connecting to server live event stream...']);

    const targetUrl = repoUrl || selectedRepo?.url;
    const targetId = repoId || selectedRepo?.id;

    return new Promise<Scan | null>((resolve, reject) => {
      const params = new URLSearchParams();
      if (targetId) params.append('repoId', targetId);
      else if (targetUrl) params.append('repoUrl', targetUrl);

      // Base API URL handling (development / production fallback)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const streamUrl = `${baseUrl}/scans/stream?${params.toString()}`;

      const eventSource = new EventSource(streamUrl, { withCredentials: true });
      let completedScan: Scan | null = null;

      eventSource.addEventListener('progress', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.message) {
            setStatusLogs(prev => [...prev, payload.message]);
          }
          if (typeof payload.percent === 'number') {
            setProgressPercent(payload.percent);
          }
        } catch (err) {
          console.error('Failed to parse SSE progress:', err);
        }
      });

      eventSource.addEventListener('complete', async (e: MessageEvent) => {
        try {
          const scanResult: Scan = JSON.parse(e.data);
          completedScan = scanResult;
          setCurrentScan(scanResult);
          setProgressPercent(100);
          await fetchRepos();
        } catch (err) {
          console.error('Failed to parse SSE complete scan payload:', err);
        } finally {
          eventSource.close();
          setTimeout(() => {
            setScanning(false);
            resolve(completedScan);
          }, 800);
        }
      });

      eventSource.addEventListener('error', async (e: any) => {
        eventSource.close();
        console.warn('SSE Stream disconnected or unsupported, attempting HTTP fallback scan...');

        // Fallback to standard HTTP scan endpoint if SSE stream connection fails
        try {
          setStatusLogs(prev => [...prev, '[Fallback] Switching to standard scan pipeline...']);
          const scanResult = await scanService.runScan({ repoUrl: targetUrl, repoId: targetId });
          setStatusLogs(prev => [...prev, `[Success] Audit completed in ${scanResult.durationMs}ms. Score: ${scanResult.overallScore}/100.`]);
          setCurrentScan(scanResult);
          setProgressPercent(100);
          await fetchRepos();
          setTimeout(() => setScanning(false), 800);
          resolve(scanResult);
        } catch (fallbackErr: any) {
          const errorMsg = fallbackErr.response?.data?.error || fallbackErr.message || 'Scan failed';
          setStatusLogs(prev => [...prev, `[Error] ${errorMsg}`]);
          setScanning(false);
          reject(fallbackErr);
        }
      });
    });
  };

  const connectNewRepo = async (url: string): Promise<ConnectedRepo | null> => {
    try {
      const repo = await repoService.connectRepo(url);
      setRepos(prev => [repo, ...prev]);
      setSelectedRepo(repo);
      return repo;
    } catch (err: any) {
      console.error('Failed to connect repo:', err);
      throw err;
    }
  };

  return (
    <ScanContext.Provider
      value={{
        repos,
        selectedRepo,
        currentScan,
        loadingRepos,
        scanning,
        statusLogs,
        progressPercent,
        selectRepo,
        fetchRepos,
        triggerScan,
        connectNewRepo,
        loadScanDetails
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => useContext(ScanContext);
