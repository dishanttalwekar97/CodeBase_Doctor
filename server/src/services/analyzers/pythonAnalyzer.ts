import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzePython(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  function scanDir(dir: string) {
    let files: string[] = [];
    try {
      files = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const file of files) {
      if (['node_modules', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build'].includes(file)) {
        continue;
      }

      const fullPath = path.join(dir, file);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.py')) {
        analyzePythonFile(fullPath, repoDir, findings);
      } else if (file === 'requirements.txt' || file === 'Pipfile' || file === 'pyproject.toml') {
        analyzePythonManifest(fullPath, repoDir, findings);
      }
    }
  }

  scanDir(repoDir);
  return findings;
}

function analyzePythonFile(filePath: string, repoDir: string, findings: RawFinding[]) {
  const relPath = path.relative(repoDir, filePath).replace(/\\/g, '/');
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return;
  }

  const lines = content.split('\n');
  let isAsyncDef = false;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    if (trimmed.startsWith('async def ')) {
      isAsyncDef = true;
    } else if (trimmed.startsWith('def ')) {
      isAsyncDef = false;
    }

    // Rule 1: Python SQL Injection via string formatting (f-string or %)
    if (
      /execute\s*\(\s*f["'].*(SELECT|INSERT|UPDATE|DELETE).*\$\{?/i.test(trimmed) ||
      /execute\s*\(\s*["'].*(SELECT|INSERT|UPDATE|DELETE).*%\s*/i.test(trimmed) ||
      /execute\s*\(\s*f["'].*WHERE.*=\{/i.test(trimmed)
    ) {
      findings.push({
        category: 'SECURITY',
        title: 'Python SQL Injection via String Formatting',
        description: 'Unparameterized raw SQL string interpolation detected in Python database query.',
        severity: 'CRITICAL',
        filePath: relPath,
        lineNumber: lineNum,
        contextCode: trimmed,
        ruleId: 'PY-SEC-001'
      });
    }

    // Rule 2: Hardcoded Secrets in Python
    if (
      /(api_key|secret_key|aws_secret|jwt_secret)\s*=\s*["'][A-Za-z0-9_\-]{16,}["']/i.test(trimmed) &&
      !trimmed.includes('os.environ') &&
      !trimmed.includes('getenv')
    ) {
      findings.push({
        category: 'SECURITY',
        title: 'Hardcoded Secret Token in Python File',
        description: 'Plaintext secret API key or credential assigned directly in Python source code.',
        severity: 'CRITICAL',
        filePath: relPath,
        lineNumber: lineNum,
        contextCode: trimmed,
        ruleId: 'PY-SEC-002'
      });
    }

    // Rule 3: Event Loop Blocking in Async Def (time.sleep or requests.get)
    if (isAsyncDef && (trimmed.includes('time.sleep(') || trimmed.includes('requests.get(') || trimmed.includes('requests.post('))) {
      findings.push({
        category: 'PERFORMANCE',
        title: 'Synchronous Blocking Call inside Python `async def`',
        description: 'Synchronous `time.sleep()` or `requests` call inside an async coroutine blocks the asyncio event loop.',
        severity: 'IMPORTANT',
        filePath: relPath,
        lineNumber: lineNum,
        contextCode: trimmed,
        ruleId: 'PY-PERF-001'
      });
    }

    // Rule 4: Bare Except Clause
    if (/^except\s*:\s*$/i.test(trimmed)) {
      findings.push({
        category: 'ARCHITECTURE',
        title: 'Bare Exception Catch (`except:`)',
        description: 'Bare `except:` catches KeyboardInterrupt and SystemExit, hiding critical system signals.',
        severity: 'IMPROVEMENT',
        filePath: relPath,
        lineNumber: lineNum,
        contextCode: trimmed,
        ruleId: 'PY-ARCH-001'
      });
    }
  });
}

function analyzePythonManifest(manifestPath: string, repoDir: string, findings: RawFinding[]) {
  const relPath = path.relative(repoDir, manifestPath).replace(/\\/g, '/');
  let content = '';
  try {
    content = fs.readFileSync(manifestPath, 'utf-8');
  } catch {
    return;
  }

  const legacyLibs = ['urllib2', 'pycrypto', 'm2crypto', 'jinja2<3.0.0'];
  legacyLibs.forEach(lib => {
    if (content.toLowerCase().includes(lib)) {
      findings.push({
        category: 'DEPENDENCIES',
        title: `Deprecated / Vulnerable Python Package (\`${lib}\`)`,
        description: `Python package manifest references deprecated package \`${lib}\`.`,
        severity: 'IMPORTANT',
        filePath: relPath,
        lineNumber: 1,
        contextCode: content.slice(0, 100),
        ruleId: 'PY-DEP-001'
      });
    }
  });
}
