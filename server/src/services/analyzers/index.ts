import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';
import { analyzeSecurity } from './securityAnalyzer';
import { analyzePerformance } from './performanceAnalyzer';
import { analyzeArchitecture } from './architectureAnalyzer';
import { analyzeDependencies } from './dependencyAnalyzer';
import { analyzeTesting } from './testingAnalyzer';
import { analyzeDocker } from './dockerAnalyzer';
import { analyzeCloud } from './cloudAnalyzer';
import { analyzePython } from './pythonAnalyzer';

export type ProgressCallback = (message: string, percent: number) => void;

export async function runFullAnalysis(repoDir: string, onProgress?: ProgressCallback): Promise<RawFinding[]> {
  console.log(`[Analysis Engine] Starting multi-category scan on target repo: ${repoDir}`);

  onProgress?.('[Security Analyzer] Auditing code AST for hardcoded secrets, TLS bypass & SQL injection...', 20);
  const securityFindings = await analyzeSecurity(repoDir);
  onProgress?.(`[Security Analyzer] Completed (${securityFindings.length} issue(s) identified)`, 30);

  onProgress?.('[Performance Analyzer] Scanning async loop calls, N+1 queries & sync file I/O...', 35);
  const performanceFindings = await analyzePerformance(repoDir);
  onProgress?.(`[Performance Analyzer] Completed (${performanceFindings.length} issue(s) identified)`, 45);

  onProgress?.('[Architecture Analyzer] Auditing file line limits, block nesting & Express async routes...', 50);
  const architectureFindings = await analyzeArchitecture(repoDir);
  onProgress?.(`[Architecture Analyzer] Completed (${architectureFindings.length} issue(s) identified)`, 58);

  onProgress?.('[Dependency Analyzer] Auditing package lockfiles & deprecated package dependencies...', 62);
  const dependencyFindings = await analyzeDependencies(repoDir);
  onProgress?.(`[Dependency Analyzer] Completed (${dependencyFindings.length} issue(s) identified)`, 70);

  onProgress?.('[Infrastructure & Testing] Auditing test coverage, Hadolint Dockerfile rules & K8s probes...', 75);
  const [testingFindings, dockerFindings, cloudFindings, pythonFindings] = await Promise.all([
    analyzeTesting(repoDir),
    analyzeDocker(repoDir),
    analyzeCloud(repoDir),
    analyzePython(repoDir)
  ]);
  onProgress?.('[Infrastructure & Testing] Completed all container & test suite checks', 82);

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
  const verifiedFindings = ensureExistingFilePaths(deduplicated, repoDir);

  console.log(`[Analysis Engine] Completed scan. Raw findings: ${allFindings.length}, Deduplicated: ${deduplicated.length}, Verified: ${verifiedFindings.length}`);
  return verifiedFindings;
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

function findPrimaryFileInRepo(repoDir: string): string {
  const priorityCandidates = [
    'index.html',
    'index.js',
    'index.ts',
    'src/index.ts',
    'src/index.js',
    'main.py',
    'app.py',
    'package.json',
    'README.md',
    'style.css'
  ];

  for (const candidate of priorityCandidates) {
    if (fs.existsSync(path.join(repoDir, candidate))) {
      return candidate;
    }
  }

  let foundFile = '';
  function walk(dir: string) {
    if (foundFile) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (foundFile) break;
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
            walk(path.join(dir, entry.name));
          }
        } else if (entry.isFile()) {
          const rel = path.relative(repoDir, path.join(dir, entry.name)).replace(/\\/g, '/');
          foundFile = rel;
        }
      }
    } catch {}
  }

  walk(repoDir);
  return foundFile || 'index.html';
}

function ensureExistingFilePaths(findings: RawFinding[], repoDir: string): RawFinding[] {
  const primaryFile = findPrimaryFileInRepo(repoDir);
  const result: RawFinding[] = [];

  for (const finding of findings) {
    const fullPath = path.join(repoDir, finding.filePath || '');
    if (!finding.filePath || !fs.existsSync(fullPath)) {
      if (finding.ruleId === 'CLD-005') {
        continue;
      }
      finding.filePath = primaryFile;
    }
    result.push(finding);
  }

  return result;
}


