import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzeCloud(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  const composePath1 = path.join(repoDir, 'docker-compose.yml');
  const composePath2 = path.join(repoDir, 'docker-compose.yaml');
  const composePath = fs.existsSync(composePath1) ? composePath1 : (fs.existsSync(composePath2) ? composePath2 : null);

  // 1. Docker Compose Analysis
  if (composePath) {
    const relCompose = path.relative(repoDir, composePath).replace(/\\/g, '/');
    try {
      const content = await fs.promises.readFile(composePath, 'utf8');
      const lines = content.split('\n');

      if (!content.includes('healthcheck:')) {
        findings.push({
          category: 'CLOUD',
          title: 'Missing Container Healthcheck in Compose',
          description: '`docker-compose.yml` service definitions lack a `healthcheck` stanza. Container orchestrators cannot monitor container readiness.',
          severity: 'IMPORTANT',
          filePath: relCompose,
          lineNumber: 1,
          ruleId: 'CLD-001',
          contextCode: 'healthcheck stanza missing'
        });
      }

      // Hardcoded environment secrets in compose
      lines.forEach((line, idx) => {
        if ((line.includes('PASSWORD=') || line.includes('SECRET=')) && !line.includes('${')) {
          findings.push({
            category: 'CLOUD',
            title: 'Hardcoded Secret in Docker Compose',
            description: 'Found unencrypted plaintext password or secret literal in `docker-compose.yml`. Use `.env` file references.',
            severity: 'CRITICAL',
            filePath: relCompose,
            lineNumber: idx + 1,
            ruleId: 'CLD-002',
            contextCode: line.trim()
          });
        }
      });
    } catch {
      // Read error
    }
  }

  // 2. Scan for Kubernetes / Helm manifests
  async function scanK8s(dir: string) {
    let entries: fs.Dirent[] = [];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
          await scanK8s(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.yaml' || ext === '.yml') {
          const relPath = path.relative(repoDir, fullPath).replace(/\\/g, '/');
          try {
            const content = await fs.promises.readFile(fullPath, 'utf8');
            if (content.includes('apiVersion:') && content.includes('kind:')) {
              // It's a K8s manifest
              if (!content.includes('resources:') || !content.includes('limits:')) {
                findings.push({
                  category: 'CLOUD',
                  title: 'Missing Kubernetes Container Resource Limits',
                  description: 'Kubernetes deployment manifest lacks `resources.limits` (CPU/Memory). Unbounded containers risk OOM killing node instances.',
                  severity: 'IMPORTANT',
                  filePath: relPath,
                  lineNumber: 1,
                  ruleId: 'CLD-003',
                  contextCode: 'resources.limits missing'
                });
              }

              if (!content.includes('livenessProbe') && !content.includes('readinessProbe')) {
                findings.push({
                  category: 'CLOUD',
                  title: 'Missing Kubernetes Liveness / Readiness Probes',
                  description: 'Deployment manifest lacks `livenessProbe` and `readinessProbe`. Kubernetes cannot auto-heal frozen container pods.',
                  severity: 'IMPORTANT',
                  filePath: relPath,
                  lineNumber: 1,
                  ruleId: 'CLD-004',
                  contextCode: 'livenessProbe missing'
                });
              }
            }
          } catch {
            // Ignore read errors
          }
        }
      }
    }
  }

  await scanK8s(repoDir);

  // 3. Application Health Check Route Check
  let hasHealthEndpoint = false;
  let hasServerFiles = false;

  async function checkAppHealthRoute(dir: string) {
    let entries: fs.Dirent[] = [];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
          await checkAppHealthRoute(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.ts', '.py', '.go'].includes(ext)) {
          hasServerFiles = true;
          try {
            const content = await fs.promises.readFile(fullPath, 'utf8');
            if (content.includes('/health') || content.includes('/healthz') || content.includes('/ping')) {
              hasHealthEndpoint = true;
            }
          } catch {}
        }
      }
    }
  }

  await checkAppHealthRoute(repoDir);

  if (hasServerFiles && !hasHealthEndpoint && !composePath) {
    const defaultCloudTargetFile = 
      fs.existsSync(path.join(repoDir, 'src/index.ts')) ? 'src/index.ts' :
      fs.existsSync(path.join(repoDir, 'src/index.js')) ? 'src/index.js' :
      fs.existsSync(path.join(repoDir, 'package.json')) ? 'package.json' : 'package.json';

    findings.push({
      category: 'CLOUD',
      title: 'Missing Cloud Health Check Endpoint (/health or /healthz)',
      description: 'Web application server lacks an explicit health check endpoint (`/health` or `/healthz`) for load balancers and container probes.',
      severity: 'IMPROVEMENT',
      filePath: defaultCloudTargetFile,
      lineNumber: 1,
      ruleId: 'CLD-005',
      contextCode: 'No /health endpoint detected'
    });
  }

  return findings;
}
