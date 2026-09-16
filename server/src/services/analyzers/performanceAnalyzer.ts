import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzePerformance(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  const patterns = [
    {
      id: 'PERF-001',
      name: 'Async DB/Network Call Inside Loop',
      regex: /(for\s*\(|while\s*\(|\.map\(|\.forEach\().*?await\s+(prisma|db|fetch|axios|http|this\.)/gs,
      lineRegex: /await\s+(prisma|db|fetch|axios|http|repository|client)/i,
      severity: 'CRITICAL' as const,
      description: 'Found an `await` async database or HTTP call inside a loop iteration (N+1 query problem). Use `Promise.all()` or batch database queries.'
    },
    {
      id: 'PERF-002',
      name: 'Synchronous File System Operation',
      regex: /fs\.readFileSync|fs\.writeFileSync|fs\.existsSync|fs\.readdirSync/g,
      severity: 'IMPORTANT' as const,
      description: 'Synchronous file system call (`readFileSync`/`writeFileSync`) blocks the Node.js event loop. Use async `fs.promises` instead.'
    },
    {
      id: 'PERF-003',
      name: 'Unbounded Database Query',
      regex: /(prisma\.\w+\.findMany\(\s*\{\s*\}\s*\)|db\.query\(['"]SELECT \* FROM \w+['"]\))/gi,
      severity: 'IMPORTANT' as const,
      description: 'Database query executed without pagination or limit constraints, potentially fetching huge datasets into memory.'
    },
    {
      id: 'PERF-004',
      name: 'Memory Leak Risk: Disabling Event Listener Limits',
      regex: /setMaxListeners\(0\)/g,
      severity: 'IMPROVEMENT' as const,
      description: '`setMaxListeners(0)` removes memory leak safety warnings on Node EventEmitter instances.'
    }
  ];

  await scanFiles(repoDir, (filePath, content) => {
    const relPath = path.relative(repoDir, filePath).replace(/\\/g, '/');
    const lines = content.split('\n');

    // Check line by line for simpler regexes
    lines.forEach((line, index) => {
      if (line.includes('readFileSync') || line.includes('writeFileSync') || line.includes('readdirSync')) {
        findings.push({
          category: 'PERFORMANCE',
          title: 'Synchronous File System Operation',
          description: 'Synchronous I/O blocks the event loop. Replace with `fs.promises` equivalent.',
          severity: 'IMPORTANT',
          filePath: relPath,
          lineNumber: index + 1,
          ruleId: 'PERF-002',
          contextCode: line.trim()
        });
      }

      if (line.includes('setMaxListeners(0)')) {
        findings.push({
          category: 'PERFORMANCE',
          title: 'Memory Leak Risk: Disabling Event Listener Limits',
          description: 'Disabling listener limits hides memory leak warnings in Node EventEmitters.',
          severity: 'IMPROVEMENT',
          filePath: relPath,
          lineNumber: index + 1,
          ruleId: 'PERF-004',
          contextCode: line.trim()
        });
      }
    });

    // Check for loop + await pattern across block context
    const loopRegex = /(for\s*\([^)]+\)\s*\{[^}]*await|while\s*\([^)]+\)\s*\{[^}]*await|\.forEach\(async[^}]*await|\.map\(async[^}]*await)/g;
    let match;
    while ((match = loopRegex.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      findings.push({
        category: 'PERFORMANCE',
        title: 'Async/Await Call Inside Loop (N+1 Risk)',
        description: 'Executing sequential async network or database operations inside a loop severely degrades request throughput.',
        severity: 'CRITICAL',
        filePath: relPath,
        lineNumber: lineNum,
        ruleId: 'PERF-001',
        contextCode: match[0].split('\n')[0].trim()
      });
    }
  });

  return findings;
}

async function scanFiles(repoDir: string, callback: (filePath: string, content: string) => void) {
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
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
          try {
            const content = await fs.promises.readFile(fullPath, 'utf8');
            callback(fullPath, content);
          } catch {
            // Ignore read errors
          }
        }
      }
    }
  }

  await walk(repoDir);
}
