export type Severity = 'CRITICAL' | 'IMPORTANT' | 'IMPROVEMENT';

export type Category = 
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'ARCHITECTURE'
  | 'DEPENDENCIES'
  | 'TESTING'
  | 'DOCKER'
  | 'CLOUD';

export interface RawFinding {
  category: Category;
  title: string;
  description: string;
  severity: Severity;
  filePath: string;
  lineNumber?: number;
  ruleId?: string;
  contextCode?: string;
}

export interface AIEnhancedIssue extends RawFinding {
  aiExplanation: string;
  beforeSnippet: string;
  afterSnippet: string;
  impact: string;
}

export interface CategoryScores {
  securityScore: number;
  performanceScore: number;
  architectureScore: number;
  dependencyScore: number;
  testingScore: number;
  dockerScore: number;
  cloudScore: number;
}

export interface AnalysisResult {
  overallScore: number;
  categoryScores: CategoryScores;
  issues: AIEnhancedIssue[];
  durationMs: number;
  commitHash?: string;
}
