import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { config } from '../config';

export async function cloneRepo(repoUrl: string, accessToken?: string): Promise<{
  targetDir: string;
  commitHash: string;
  cleanup: () => Promise<void>;
}> {
  const tempDir = path.join(os.tmpdir(), `codebase-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

  let cloneUrl = repoUrl;
  if (accessToken && repoUrl.startsWith('https://github.com/')) {
    const repoPath = repoUrl.replace('https://github.com/', '');
    cloneUrl = `https://x-access-token:${accessToken}@github.com/${repoPath}`;
  }

  // Ensure trailing .git if missing
  if (!cloneUrl.endsWith('.git')) {
    cloneUrl += '.git';
  }

  const git: SimpleGit = simpleGit();
  await git.clone(cloneUrl, tempDir, ['--depth', '1']);

  const repoGit: SimpleGit = simpleGit(tempDir);
  let commitHash = 'unknown';
  try {
    const log = await repoGit.log(['-1']);
    commitHash = log.latest?.hash || 'unknown';
  } catch (err) {
    // If commit log fails, leave as unknown
  }

  const cleanup = async () => {
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.error(`Failed to cleanup temp directory ${tempDir}:`, err);
    }
  };

  return {
    targetDir: tempDir,
    commitHash,
    cleanup
  };
}
