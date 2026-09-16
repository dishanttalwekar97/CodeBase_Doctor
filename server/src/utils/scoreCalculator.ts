import { RawFinding, Category, CategoryScores } from '../types';

const CATEGORY_WEIGHTS: Record<Category, number> = {
  SECURITY: 0.25,
  PERFORMANCE: 0.15,
  ARCHITECTURE: 0.15,
  DEPENDENCIES: 0.15,
  TESTING: 0.10,
  DOCKER: 0.10,
  CLOUD: 0.10
};

const SEVERITY_DEDUCTIONS = {
  CRITICAL: 20,
  IMPORTANT: 10,
  IMPROVEMENT: 4
};

export function calculateScores(findings: RawFinding[]): {
  overallScore: number;
  categoryScores: CategoryScores;
  grade: string;
} {
  const categoryDeductions: Record<Category, number> = {
    SECURITY: 0,
    PERFORMANCE: 0,
    ARCHITECTURE: 0,
    DEPENDENCIES: 0,
    TESTING: 0,
    DOCKER: 0,
    CLOUD: 0
  };

  for (const finding of findings) {
    const deduction = SEVERITY_DEDUCTIONS[finding.severity] || 4;
    categoryDeductions[finding.category] += deduction;
  }

  const categoryScores: CategoryScores = {
    securityScore: Math.max(0, 100 - categoryDeductions.SECURITY),
    performanceScore: Math.max(0, 100 - categoryDeductions.PERFORMANCE),
    architectureScore: Math.max(0, 100 - categoryDeductions.ARCHITECTURE),
    dependencyScore: Math.max(0, 100 - categoryDeductions.DEPENDENCIES),
    testingScore: Math.max(0, 100 - categoryDeductions.TESTING),
    dockerScore: Math.max(0, 100 - categoryDeductions.DOCKER),
    cloudScore: Math.max(0, 100 - categoryDeductions.CLOUD)
  };

  let weightedSum = 
    categoryScores.securityScore * CATEGORY_WEIGHTS.SECURITY +
    categoryScores.performanceScore * CATEGORY_WEIGHTS.PERFORMANCE +
    categoryScores.architectureScore * CATEGORY_WEIGHTS.ARCHITECTURE +
    categoryScores.dependencyScore * CATEGORY_WEIGHTS.DEPENDENCIES +
    categoryScores.testingScore * CATEGORY_WEIGHTS.TESTING +
    categoryScores.dockerScore * CATEGORY_WEIGHTS.DOCKER +
    categoryScores.cloudScore * CATEGORY_WEIGHTS.CLOUD;

  const overallScore = Math.round(weightedSum);

  let grade = 'F';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 50) grade = 'C';
  else if (overallScore >= 35) grade = 'D';

  return {
    overallScore,
    categoryScores,
    grade
  };
}
