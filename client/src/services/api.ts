import axios from 'axios';
import type { User, ConnectedRepo, Scan } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  getMe: async (): Promise<{ user: User | null; isDemo: boolean }> => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch {
      return { user: null, isDemo: false };
    }
  },
  loginDemo: async (): Promise<User> => {
    const res = await api.post('/auth/demo');
    return res.data.user;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  toggleMode: async (): Promise<{ demoMode: boolean; modeLabel: string }> => {
    const res = await api.post('/auth/toggle-mode');
    return res.data;
  }
};

export const repoService = {
  getRepos: async (): Promise<ConnectedRepo[]> => {
    const res = await api.get('/repos');
    return res.data;
  },
  getUserGitHubRepos: async (): Promise<Array<{ id: number; name: string; fullName: string; owner: string; htmlUrl: string; description: string; defaultBranch: string; isPrivate: boolean; stars: number; language: string }>> => {
    const res = await api.get('/repos/user-github-repos');
    return res.data;
  },
  connectRepo: async (url: string): Promise<ConnectedRepo> => {
    const res = await api.post('/repos/connect', { url });
    return res.data;
  }
};

export const scanService = {
  runScan: async (params: { repoId?: string; repoUrl?: string }): Promise<Scan> => {
    const res = await api.post('/scans/run', params, { timeout: 120000 }); // 2-min timeout for clones
    return res.data;
  },
  getScanDetails: async (scanId: string): Promise<Scan> => {
    const res = await api.get(`/scans/${scanId}`);
    return res.data;
  },
  getRepoScans: async (repoId: string): Promise<Scan[]> => {
    const res = await api.get(`/scans/repo/${repoId}`);
    return res.data;
  },
  applyFix: async (scanId: string, issueId: string): Promise<{ updatedScan: Scan; scoreGain: number }> => {
    const res = await api.post('/scans/apply-fix', { scanId, issueId });
    return res.data;
  },
  createFixPR: async (scanId: string, issueId: string): Promise<{ success: boolean; prUrl: string; prNumber: number; branchName: string; isDemo?: boolean }> => {
    const res = await api.post('/scans/create-pr', { scanId, issueId });
    return res.data;
  },
  generateUnitTest: async (issueId: string): Promise<{ testCode: string; fileName: string; filePath: string }> => {
    const res = await api.post('/scans/generate-tests', { issueId });
    return res.data;
  },
  getFileContent: async (scanId: string, filePath: string): Promise<{ content: string; filePath: string }> => {
    const res = await api.get(`/scans/${scanId}/file-content`, { params: { filePath } });
    return res.data;
  },
  downloadReport: (scanId: string, format: 'markdown' | 'json' = 'markdown') => {
    window.open(`${API_BASE_URL}/scans/${scanId}/export?format=${format}`, '_blank');
  },
  openExecutiveReport: (scanId: string) => {
    window.open(`${API_BASE_URL}/scans/${scanId}/export-html`, '_blank');
  }
};

