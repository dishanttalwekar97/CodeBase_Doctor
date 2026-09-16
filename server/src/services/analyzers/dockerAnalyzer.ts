import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzeDocker(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  const dockerfilePath = path.join(repoDir, 'Dockerfile');
  const dockerIgnorePath = path.join(repoDir, '.dockerignore');

  if (!fs.existsSync(dockerfilePath)) {
    // Dockerfile doesn't exist - not a failure, but we can recommend one if project is Node/Python
    return findings;
  }

  // 1. Missing .dockerignore
  if (!fs.existsSync(dockerIgnorePath)) {
    findings.push({
      category: 'DOCKER',
      title: 'Missing .dockerignore File',
      description: 'Repository contains a Dockerfile but lacks a `.dockerignore` file. This risks copying `node_modules`, build artifacts, and secret `.env` files into container context.',
      severity: 'IMPORTANT',
      filePath: '.dockerignore',
      lineNumber: 1,
      ruleId: 'DOC-001',
      contextCode: 'File missing'
    });
  }

  try {
    const content = await fs.promises.readFile(dockerfilePath, 'utf8');
    const lines = content.split('\n');

    let hasUserDirective = false;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // 2. Unpinned Base Image Tag
      if (trimmed.startsWith('FROM')) {
        if (trimmed.includes(':latest') || (!trimmed.includes(':') && !trimmed.includes('AS'))) {
          findings.push({
            category: 'DOCKER',
            title: 'Unpinned Docker Base Image Tag',
            description: '`FROM` directive uses `:latest` or unpinned version tag. Base image changes can silently break container deployments.',
            severity: 'IMPORTANT',
            filePath: 'Dockerfile',
            lineNumber: idx + 1,
            ruleId: 'DOC-002',
            contextCode: trimmed
          });
        }
      }

      // 3. Check for USER directive
      if (trimmed.startsWith('USER')) {
        hasUserDirective = true;
      }

      // 4. Multiple RUN commands that could be combined
      if (trimmed.startsWith('RUN apt-get install') || trimmed.startsWith('RUN apk add')) {
        if (!trimmed.includes('&&')) {
          findings.push({
            category: 'DOCKER',
            title: 'Unoptimized Docker Image Layering',
            description: 'Single package manager `RUN` command without layer chaining (`&&`) creates bloated intermediate Docker image layers.',
            severity: 'IMPROVEMENT',
            filePath: 'Dockerfile',
            lineNumber: idx + 1,
            ruleId: 'DOC-003',
            contextCode: trimmed
          });
        }
      }

      // 5. COPY . . without prior package.json copy
      if (trimmed === 'COPY . .' && idx < 5) {
        findings.push({
          category: 'DOCKER',
          title: 'Suboptimal Docker Build Cache Usage',
          description: '`COPY . .` executed before copying dependency files (`package.json`) invalidates Docker layer cache on every code edit.',
          severity: 'IMPORTANT',
          filePath: 'Dockerfile',
          lineNumber: idx + 1,
          ruleId: 'DOC-004',
          contextCode: trimmed
        });
      }
    });

    // 6. Missing Non-Root USER Directive (Hadolint DL3002)
    if (!hasUserDirective) {
      findings.push({
        category: 'DOCKER',
        title: 'Container Runs as Root User (Missing USER Directive)',
        description: 'Dockerfile lacks a non-root `USER` directive. Running as root in containers poses container breakout vulnerabilities.',
        severity: 'CRITICAL',
        filePath: 'Dockerfile',
        lineNumber: lines.length,
        ruleId: 'DOC-005',
        contextCode: 'USER node / USER 10001 missing'
      });
    }

  } catch (err) {
    // Read error
  }

  return findings;
}
