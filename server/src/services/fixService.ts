import { prisma } from '../db';
import { calculateScores } from '../utils/scoreCalculator';

export async function applyAIFix(scanId: string, issueId: string): Promise<{
  updatedScan: any;
  resolvedIssue: any;
  scoreGain: number;
}> {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      issues: true,
      repo: true
    }
  });

  if (!scan) {
    throw new Error('Scan not found');
  }

  const issue = scan.issues.find(i => i.id === issueId);
  if (!issue) {
    throw new Error('Issue not found in scan');
  }

  const oldOverallScore = scan.overallScore;

  // 1. Mark issue as resolved
  const resolvedIssue = await prisma.issue.update({
    where: { id: issueId },
    data: { isResolved: true }
  });

  // 2. Filter out resolved issues to recalculate score
  const remainingActiveIssues = scan.issues.filter(i => i.id !== issueId && !i.isResolved);

  // 3. Recalculate score with remaining active issues
  const { overallScore: newOverallScore, categoryScores } = calculateScores(remainingActiveIssues as any);
  const scoreGain = Math.max(1, newOverallScore - oldOverallScore);

  // 4. Update Scan scores in Prisma DB
  const updatedScan = await prisma.scan.update({
    where: { id: scanId },
    data: {
      overallScore: newOverallScore,
      securityScore: categoryScores.securityScore,
      performanceScore: categoryScores.performanceScore,
      architectureScore: categoryScores.architectureScore,
      dependencyScore: categoryScores.dependencyScore,
      testingScore: categoryScores.testingScore,
      dockerScore: categoryScores.dockerScore,
      cloudScore: categoryScores.cloudScore
    },
    include: {
      issues: true,
      repo: true
    }
  });

  return {
    updatedScan,
    resolvedIssue,
    scoreGain
  };
}
