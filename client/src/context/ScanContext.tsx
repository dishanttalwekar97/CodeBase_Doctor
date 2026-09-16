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
    setStatusLogs(['[Engine] Initiating static analysis request...']);

    const targetUrl = repoUrl || selectedRepo?.url;
    const targetId = repoId || selectedRepo?.id;

    // Simulate progress log steps for UX feedback during backend scan
    const logInterval = setInterval(() => {
      setStatusLogs(prev => {
        if (prev.length === 1) return [...prev, '[Git] Cloning repository to server temporary environment...'];
        if (prev.length === 2) return [...prev, '[Analysis] Running Security & Secret Scanner (7 rules)...'];
        if (prev.length === 3) return [...prev, '[Analysis] Evaluating Async Performance & N+1 Query patterns...'];
        if (prev.length === 4) return [...prev, '[Analysis] Auditing package.json dependencies and lockfiles...'];
        if (prev.length === 5) return [...prev, '[Analysis] Auditing Hadolint Dockerfile rules & Cloud K8s manifests...'];
        if (prev.length === 6) return [...prev, '[Score] Computing weighted Software Health Score (0-100)...'];
        if (prev.length === 7) return [...prev, '[AI Service] Enhancing findings with LLM explanations & fix diffs...'];
        return prev;
      });
    }, 1500);

    try {
      const scanResult = await scanService.runScan({ repoUrl: targetUrl, repoId: targetId });
      clearInterval(logInterval);

      setStatusLogs(prev => [...prev, `[Success] Scan completed in ${scanResult.durationMs}ms. Score: ${scanResult.overallScore}/100.`]);
      setCurrentScan(scanResult);

      await fetchRepos(); // Refresh repo list with updated last scan date
      return scanResult;
    } catch (err: any) {
      clearInterval(logInterval);
      setStatusLogs(prev => [...prev, `[Error] Scan failed: ${err.response?.data?.error || err.message}`]);
      throw err;
    } finally {
      setTimeout(() => {
        setScanning(false);
      }, 1000);
    }
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
