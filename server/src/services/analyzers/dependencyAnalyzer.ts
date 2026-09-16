import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzeDependencies(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  const packageJsonPath = path.join(repoDir, 'package.json');
  const packageLockPath = path.join(repoDir, 'package-lock.json');
  const yarnLockPath = path.join(repoDir, 'yarn.lock');
  const pnpmLockPath = path.join(repoDir, 'pnpm-lock.yaml');

  if (!fs.existsSync(packageJsonPath)) {
    return findings; // Non-node project or missing root package.json
  }

  // 1. Lockfile Check
  if (!fs.existsSync(packageLockPath) && !fs.existsSync(yarnLockPath) && !fs.existsSync(pnpmLockPath)) {
    findings.push({
      category: 'DEPENDENCIES',
      title: 'Missing Package Lockfile',
      description: 'Repository lacks a lockfile (`package-lock.json` or `yarn.lock`). Non-deterministic dependency builds create production risks.',
      severity: 'IMPORTANT',
      filePath: 'package.json',
      lineNumber: 1,
      ruleId: 'DEP-001',
      contextCode: 'Lockfile missing in root'
    });
  }

  try {
    const rawContent = await fs.promises.readFile(packageJsonPath, 'utf8');
    const pkgJson = JSON.parse(rawContent);

    const allDeps = {
      ...(pkgJson.dependencies || {}),
      ...(pkgJson.devDependencies || {})
    };

    const lines = rawContent.split('\n');

    // 2. Wildcard / Loose Specifiers
    for (const [depName, version] of Object.entries(allDeps)) {
      const verStr = String(version);
      const lineNum = lines.findIndex(l => l.includes(`"${depName}"`)) + 1;

      if (verStr === '*' || verStr === 'latest') {
        findings.push({
          category: 'DEPENDENCIES',
          title: `Unpinned Dependency Version (${depName})`,
          description: `Dependency "${depName}" uses wildcard or "latest" version. Unpinned packages can introduce breaking changes unexpectedly.`,
          severity: 'CRITICAL',
          filePath: 'package.json',
          lineNumber: lineNum > 0 ? lineNum : 1,
          ruleId: 'DEP-002',
          contextCode: `"${depName}": "${verStr}"`
        });
      }

      // Deprecated / Vulnerable Package Checks
      if (depName === 'request') {
        findings.push({
          category: 'DEPENDENCIES',
          title: 'Deprecated Package Usage: request',
          description: 'The `request` library was officially deprecated in 2020 and receives no security updates. Migrate to `axios` or native `fetch`.',
          severity: 'CRITICAL',
          filePath: 'package.json',
          lineNumber: lineNum > 0 ? lineNum : 1,
          ruleId: 'DEP-003',
          contextCode: `"${depName}": "${verStr}"`
        });
      }

      if (depName === 'moment') {
        findings.push({
          category: 'DEPENDENCIES',
          title: 'Legacy Package Usage: moment.js',
          description: 'Moment.js is in maintenance mode and adds significant bundle bloat. Migrate to `date-fns`, `dayjs`, or Luxon.',
          severity: 'IMPROVEMENT',
          filePath: 'package.json',
          lineNumber: lineNum > 0 ? lineNum : 1,
          ruleId: 'DEP-004',
          contextCode: `"${depName}": "${verStr}"`
        });
      }

      if (depName === 'uuid' && verStr.includes('3.3.')) {
        findings.push({
          category: 'DEPENDENCIES',
          title: 'Outdated Major Package Version (uuid)',
          description: 'Using legacy `uuid` v3. Modern projects should use `crypto.randomUUID()` or `uuid` v9+.',
          severity: 'IMPROVEMENT',
          filePath: 'package.json',
          lineNumber: lineNum > 0 ? lineNum : 1,
          ruleId: 'DEP-005',
          contextCode: `"${depName}": "${verStr}"`
        });
      }
    }

  } catch (err) {
    // Malformed package.json
    findings.push({
      category: 'DEPENDENCIES',
      title: 'Malformed package.json File',
      description: 'Unable to parse package.json. File contains invalid JSON syntax.',
      severity: 'CRITICAL',
      filePath: 'package.json',
      lineNumber: 1,
      ruleId: 'DEP-000',
      contextCode: 'JSON Parse Error'
    });
  }

  return findings;
}
