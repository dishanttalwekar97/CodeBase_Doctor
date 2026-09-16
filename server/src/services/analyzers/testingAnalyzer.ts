import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzeTesting(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  let totalSourceFiles = 0;
  let totalTestFiles = 0;

  const testConfigPresent = 
    fs.existsSync(path.join(repoDir, 'jest.config.js')) ||
    fs.existsSync(path.join(repoDir, 'jest.config.ts')) ||
    fs.existsSync(path.join(repoDir, 'vitest.config.ts')) ||
    fs.existsSync(path.join(repoDir, 'playwright.config.ts')) ||
    fs.existsSync(path.join(repoDir, 'cypress.config.ts'));

  async function walk(dir: string) {
    let entries: fs.Dirent[] = [];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
          if (entry.name === '__tests__' || entry.name === 'test' || entry.name === 'tests') {
            totalTestFiles += 1;
          }
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx', '.py'].includes(ext)) {
          if (entry.name.includes('.test.') || entry.name.includes('.spec.')) {
            totalTestFiles++;
          } else {
            totalSourceFiles++;
          }
        }
      }
    }
  }

  await walk(repoDir);

  if (totalTestFiles === 0) {
    findings.push({
      category: 'TESTING',
      title: 'Zero Test Suites Found',
      description: 'Repository contains no automated unit or integration test files (`*.test.ts`, `*.spec.ts`, `__tests__`). Testing ensures stability during refactoring.',
      severity: 'CRITICAL',
      filePath: 'src/',
      lineNumber: 1,
      ruleId: 'TST-001',
      contextCode: 'No test files in workspace'
    });
  } else {
    const ratio = totalTestFiles / Math.max(1, totalSourceFiles);
    if (ratio < 0.15) {
      findings.push({
        category: 'TESTING',
        title: 'Low Test File Ratio (<15%)',
        description: `Found only ${totalTestFiles} test file(s) for ${totalSourceFiles} source files. Target at least 1 test file per major module.`,
        severity: 'IMPORTANT',
        filePath: 'src/',
        lineNumber: 1,
        ruleId: 'TST-002',
        contextCode: `Ratio: ${(ratio * 100).toFixed(1)}%`
      });
    }
  }

  if (!testConfigPresent && totalSourceFiles > 5) {
    findings.push({
      category: 'TESTING',
      title: 'Missing Test Runner Configuration',
      description: 'No Jest, Vitest, Playwright, or Cypress configuration file detected.',
      severity: 'IMPROVEMENT',
      filePath: 'package.json',
      lineNumber: 1,
      ruleId: 'TST-003',
      contextCode: 'Config missing'
    });
  }

  return findings;
}
