import fs from 'fs';
import path from 'path';
import { RawFinding } from '../../types';

export async function analyzeArchitecture(repoDir: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  let totalFiles = 0;
  let largeFilesCount = 0;

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
        if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go'].includes(ext)) {
          totalFiles++;
          const relPath = path.relative(repoDir, fullPath).replace(/\\/g, '/');

          try {
            const content = await fs.promises.readFile(fullPath, 'utf8');
            const lines = content.split('\n');

            // 1. Giant File Check (>400 lines)
            if (lines.length > 400) {
              largeFilesCount++;
              findings.push({
                category: 'ARCHITECTURE',
                title: 'High File Complexity (Giant Source File)',
                description: `File has ${lines.length} lines of code. Monolithic files violate single responsibility principle and hinder maintainability.`,
                severity: lines.length > 800 ? 'CRITICAL' : 'IMPORTANT',
                filePath: relPath,
                lineNumber: 1,
                ruleId: 'ARCH-001',
                contextCode: `Total lines: ${lines.length}`
              });
            }

            // 2. Deep Block Nesting Check (Report at most 1 finding per file for max nesting level)
            let maxIndent = 0;
            let maxIndentLine = 1;
            let maxIndentContent = '';

            lines.forEach((line, idx) => {
              const trimmed = line.trim();
              // Ignore JSX tags, SVG paths, and comments
              if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('<') || trimmed.startsWith('path ') || trimmed.startsWith('d=')) {
                return;
              }

              const leadingSpaces = line.match(/^(\s{2}|\t)+/)?.[0]?.length || 0;
              if (leadingSpaces > maxIndent) {
                maxIndent = leadingSpaces;
                maxIndentLine = idx + 1;
                maxIndentContent = trimmed;
              }
            });

            if (maxIndent >= 14) {
              const startIdx = Math.max(0, maxIndentLine - 4);
              const endIdx = Math.min(lines.length, maxIndentLine + 4);
              const snippetWindow = lines.slice(startIdx, endIdx).join('\n');

              findings.push({
                category: 'ARCHITECTURE',
                title: 'Deep Code Block Nesting (Cyclomatic Complexity)',
                description: `File contains deeply nested logic blocks (level ${Math.floor(maxIndent / 2)}). Refactor nested conditionals into modular helper functions.`,
                severity: 'IMPROVEMENT',
                filePath: relPath,
                lineNumber: maxIndentLine,
                ruleId: 'ARCH-002',
                contextCode: snippetWindow
              });
            }

            // 3. Unhandled Express Route Handler Error Handling
            if (relPath.includes('route') || relPath.includes('controller') || relPath.includes('api')) {
              const asyncRouteRegex = /app\.(get|post|put|delete|patch)\(['"][^'"]+['"]\s*,\s*async\s*\(/gi;
              let match;
              while ((match = asyncRouteRegex.exec(content)) !== null) {
                const subStr = content.substring(match.index, match.index + 300);
                if (!subStr.includes('try {') && !subStr.includes('catch') && !subStr.includes('asyncHandler')) {
                  const lineNum = content.substring(0, match.index).split('\n').length;
                  findings.push({
                    category: 'ARCHITECTURE',
                    title: 'Missing Try-Catch Error Boundary in Async Handler',
                    description: 'Async route handler lacks error wrapping. Unhandled rejections will crash the Express process.',
                    severity: 'IMPORTANT',
                    filePath: relPath,
                    lineNumber: lineNum,
                    ruleId: 'ARCH-003',
                    contextCode: match[0]
                  });
                }
              }
            }

          } catch {
            // Ignore file read error
          }
        }
      }
    }
  }

  await walk(repoDir);

  return findings;
}
