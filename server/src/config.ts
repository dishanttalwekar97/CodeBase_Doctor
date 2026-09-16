import dotenv from 'dotenv';
import path from 'path';

// Load server/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let currentDemoMode = process.env.DEMO_MODE === 'true';

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  get githubClientId() {
    return process.env.GITHUB_CLIENT_ID || '';
  },
  get githubClientSecret() {
    return process.env.GITHUB_CLIENT_SECRET || '';
  },
  get githubCallbackUrl() {
    return process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';
  },
  get frontendUrl() {
    return process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  },
  get llmApiKey() {
    return process.env.LLM_API_KEY || '';
  },
  sessionSecret: process.env.SESSION_SECRET || 'codebase-doctor-secret-key-12345',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  get demoMode() {
    return currentDemoMode;
  },
  set demoMode(val: boolean) {
    currentDemoMode = val;
  },
  tempRepoDir: path.join(__dirname, '../../temp-repos')
};
