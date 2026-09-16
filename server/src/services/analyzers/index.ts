import { RawFinding } from '../../types';
import { analyzeSecurity } from './securityAnalyzer';
import { analyzePerformance } from './performanceAnalyzer';
import { analyzeArchitecture } from './architectureAnalyzer';
import { analyzeDependencies } from './dependencyAnalyzer';
import { analyzeTesting } from './testingAnalyzer';
import { analyzeDocker } from './dockerAnalyzer';
import { analyzeCloud } from './cloudAnalyzer';
import { analyzePython } from './pythonAnalyzer';

export async function runFullAnalysis(repoDir: string): Promise<RawFinding[]> {
  console.log(`[Analysis Engine] Starting multi-category scan on target repo: ${repoDir}`);

  const [
    securityFindings,
    performanceFindings,
    architectureFindings,
    dependencyFindings,
    testingFindings,
    dockerFindings,
    cloudFindings,
    pythonFindings
  ] = await Promise.all([
    analyzeSecurity(repoDir),
    analyzePerformance(repoDir),
    analyzeArchitecture(repoDir),
    analyzeDependencies(repoDir),
    analyzeTesting(repoDir),
    analyzeDocker(repoDir),
    analyzeCloud(repoDir),
    analyzePython(repoDir)
  ]);

  const allFindings = [
    ...securityFindings,
    ...performanceFindings,
    ...architectureFindings,
    ...dependencyFindings,
    ...testingFindings,
    ...dockerFindings,
    ...cloudFindings,
    ...pythonFindings
  ];

  const deduplicated = deduplicateFindings(allFindings);

  console.log(`[Analysis Engine] Completed scan. Raw findings: ${allFindings.length}, Deduplicated: ${deduplicated.length}`);
  return deduplicated;
}

function deduplicateFindings(findings: RawFinding[]): RawFinding[] {
  const fileRuleCounts: Record<string, number> = {};
  const result: RawFinding[] = [];

  for (const finding of findings) {
    const key = `${finding.filePath}:${finding.ruleId || finding.title}`;
    fileRuleCounts[key] = (fileRuleCounts[key] || 0) + 1;

    // Cap identical rule warnings to a maximum of 3 occurrences per file
    if (fileRuleCounts[key] <= 3) {
      result.push(finding);
    }
  }

  return result;
}


