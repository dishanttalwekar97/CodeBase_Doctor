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
  title: String;
  description: String;
  severity: Severity;
  filePath: String;
  lineNumber?: number;
  ruleId?: String;
  contextCode?: String;
}

export interface AIEnhancedIssue extends RawFinding {
  aiExplanation: String;
  beforeSnippet: String;
  afterSnippet: String;
  impact: String;
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
  commitHash?: String;
}
