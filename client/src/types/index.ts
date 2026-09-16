export type Severity = 'CRITICAL' | 'IMPORTANT' | 'IMPROVEMENT';

export type Category = 
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'ARCHITECTURE'
  | 'DEPENDENCIES'
  | 'TESTING'
  | 'DOCKER'
  | 'CLOUD';

export interface User {
  id: string;
  githubId: string;
  username: string;
  name?: string;
  avatarUrl?: string;
}

export interface Issue {
  id: string;
  scanId: string;
  category: Category;
  title: string;
  description: string;
  severity: Severity;
  filePath: string;
  lineNumber?: number;
  aiExplanation: string;
  beforeSnippet?: string;
  afterSnippet?: string;
  impact?: string;
  ruleId?: string;
  isResolved?: boolean;
}

export interface Scan {
  id: string;
  repoId: string;
  overallScore: number;
  securityScore: number;
  performanceScore: number;
  architectureScore: number;
  dependencyScore: number;
  testingScore: number;
  dockerScore: number;
  cloudScore: number;
  durationMs: number;
  commitHash?: string;
  status: string;
  createdAt: string;
  issues?: Issue[];
  repo?: ConnectedRepo;
}

export interface ConnectedRepo {
  id: string;
  url: string;
  owner: string;
  name: string;
  defaultBranch: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  scans?: Scan[];
}
