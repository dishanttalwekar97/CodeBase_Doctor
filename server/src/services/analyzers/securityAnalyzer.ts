import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzeSecurity(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  const patterns = [
    {
      id: 'SEC-001',
      name: 'Hardcoded AWS Access Key',
      regex: /AKIA[0-9A-Z]{16}/g,
      severity: 'CRITICAL' as const,
      description: 'Found a hardcoded AWS Access Key ID. Hardcoded credentials can easily be leaked to public source control.'
    },
    {
      id: 'SEC-002',
      name: 'Hardcoded GitHub Personal Access Token',
      regex: /ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}/g,
      severity: 'CRITICAL' as const,
      description: 'Found a hardcoded GitHub Personal Access Token. This compromises repository and organization access.'
    },
    {
      id: 'SEC-003',
      name: 'Hardcoded Private Key',
      regex: /-----BEGIN (RSA|EC|OPENSSH|DSA)? PRIVATE KEY-----/g,
      severity: 'CRITICAL' as const,
      description: 'Found an embedded private key block in source code. Private keys must never be stored in codebase repositories.'
    },
    {
      id: 'SEC-004',
      name: 'Hardcoded Secret/Password Variable',
      regex: /(password|passwd|api_key|apikey|secret_key|jwt_secret)\s*[:=]\s*["'](?!\$\{)[^"']{6,}["']/gi,
      severity: 'IMPORTANT' as const,
      description: 'Hardcoded secret or password literal assigned directly in code instead of loading from process.env.'
    },
    {
      id: 'SEC-005',
      name: 'Weak Cryptographic Algorithm (MD5/SHA1)',
      regex: /crypto\.createHash\(['"](md5|sha1)['"]\)/gi,
      severity: 'IMPORTANT' as const,
      description: 'Usage of weak cryptographic hashing algorithm (MD5 or SHA1). Use SHA-256 or bcrypt/argon2 for password hashing.'
    },
    {
      id: 'SEC-006',
      name: 'Disabled TLS/SSL Verification',
      regex: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0['"]?/gi,
      severity: 'CRITICAL' as const,
      description: 'TLS certificate validation is explicitly disabled, opening the application to Man-In-The-Middle (MITM) attacks.'
    },
    {
      id: 'SEC-007',
      name: 'Potential SQL Injection Risk',
      regex: /\b(SELECT|INSERT|UPDATE|DELETE)\b\s+.*?\b(FROM|WHERE|INTO|SET|VALUES)\b.*?=\s*["']?\s*\+\s*\w+|\b(SELECT|INSERT|UPDATE|DELETE)\b[\s\S]*?\b(FROM|WHERE|INTO|SET|VALUES)\b[\s\S]*?\$\{.*?\}|\$\{.*?\b(SELECT|INSERT|UPDATE|DELETE)\b\s+.*?\b(FROM|WHERE|INTO|SET|VALUES)\b.*?\}/gi,
      severity: 'CRITICAL' as const,
      description: 'Unescaped SQL query construction via string concatenation or template string interpolation.'
    }
  ];

  await scanDirectory(repoDir, repoDir, (filePath, content) => {
    const relPath = path.relative(repoDir, filePath).replace(/\\/g, '/');

    // Skip node_modules, .git, dist, build, etc.
    if (relPath.includes('node_modules') || relPath.includes('.git') || relPath.includes('dist')) {
      return;
    }

    const lines = content.split('\n');

    for (const pattern of patterns) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (pattern.regex.test(line)) {
          pattern.regex.lastIndex = 0; // Reset regex state
          findings.push({
            category: 'SECURITY',
            title: pattern.name,
            description: pattern.description,
            severity: pattern.severity,
            filePath: relPath,
            lineNumber: i + 1,
            ruleId: pattern.id,
            contextCode: line.trim()
          });
        }
      }
    }
  });

  return findings;
}

async function scanDirectory(
  rootDir: string,
  currentDir: string,
  callback: (filePath: string, content: string) => void
) {
  let entries: fs.Dirent[] = [];
  try {
    entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
  } catch (err) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
        await scanDirectory(rootDir, fullPath, callback);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.ts', '.jsx', '.tsx', '.json', '.py', '.env', '.yaml', '.yml', '.go', '.rs', '.java'].includes(ext) || entry.name.startsWith('.env')) {
        try {
          const content = await fs.promises.readFile(fullPath, 'utf8');
          callback(fullPath, content);
        } catch (err) {
          // Ignore binary/read errors
        }
      }
    }
  }
}
