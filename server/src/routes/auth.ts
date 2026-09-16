import { Router } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../db';
import { config } from '../config';

const router = Router();

// Get current session user & system mode
router.get('/me', async (req, res) => {
  const sessionUser = (req.session as any)?.user;
  if (!sessionUser) {
    if (config.demoMode) {
      const demoUser = await getOrCreateDemoUser();
      return res.json({ user: demoUser, isDemo: true, demoMode: true });
    }
    return res.status(401).json({ user: null, isDemo: false, demoMode: false });
  }
  res.json({
    user: sessionUser,
    isDemo: sessionUser.githubId === 'demo-user-100',
    demoMode: config.demoMode
  });
});

// Mode Toggle Route
router.post('/toggle-mode', (req, res) => {
  config.demoMode = !config.demoMode;
  res.json({
    success: true,
    demoMode: config.demoMode,
    modeLabel: config.demoMode ? 'Demo Mode' : 'Production Real Mode'
  });
});

// Demo Login route
router.post('/demo', async (req, res) => {
  const demoUser = await getOrCreateDemoUser();
  (req.session as any).user = demoUser;
  res.json({ success: true, user: demoUser });
});

// GET /api/auth/github - Start GitHub OAuth 2.0 Authorization Code Flow
router.get('/github', (req, res) => {
  if (!config.githubClientId) {
    // If no client ID configured in env, redirect to login page with setup error hint
    return res.redirect(`${config.frontendUrl}/login?error=oauth_not_configured`);
  }

  // 1. Generate cryptographically secure random state parameter for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');

  // 2. Store OAuth state securely in server session
  (req.session as any).oauthState = state;

  // 3. Build GitHub Authorization URL with scope (user:email and repo access for connecting user repositories)
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&redirect_uri=${encodeURIComponent(config.githubCallbackUrl)}&scope=user:email%20repo&state=${state}`;

  console.log('[OAuth Engine] Redirecting browser to GitHub authorization page...');
  res.redirect(authUrl);
});

// GET /api/auth/github/callback - GitHub OAuth Callback Endpoint
router.get('/github/callback', async (req, res) => {
  const { code, state, error } = req.query;

  // Handle user cancellation / error from GitHub
  if (error === 'access_denied') {
    console.warn('[OAuth Engine] User denied GitHub application authorization.');
    return res.redirect(`${config.frontendUrl}/login?error=access_denied`);
  }

  // 1. Verify state parameter against server session to prevent CSRF attacks
  const savedState = (req.session as any)?.oauthState;
  delete (req.session as any)?.oauthState; // Clear used state

  if (!state || !savedState || state !== savedState) {
    console.error('[OAuth Security] State parameter validation failed. CSRF attempt or expired state rejected.');
    return res.redirect(`${config.frontendUrl}/login?error=invalid_state`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`${config.frontendUrl}/login?error=missing_code`);
  }

  try {
    // 2. Exchange temporary authorization code for access token via backend-only call
    console.log('[OAuth Engine] Exchanging authorization code for GitHub access token...');
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: config.githubCallbackUrl
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      console.error('[OAuth Engine] GitHub token exchange failed:', tokenRes.data);
      return res.redirect(`${config.frontendUrl}/login?error=oauth_token_failed`);
    }

    // 3. Retrieve GitHub user profile using Bearer token
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const ghUser = userRes.data;
    const githubId = String(ghUser.id);
    let userEmail = ghUser.email;

    // 4. Retrieve primary verified email if missing from base profile
    if (!userEmail) {
      try {
        const emailsRes = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const primaryVerified = emailsRes.data?.find((e: any) => e.primary && e.verified);
        if (primaryVerified) {
          userEmail = primaryVerified.email;
        }
      } catch (err: any) {
        console.warn('[OAuth Engine] Unable to fetch user emails array:', err.message);
      }
    }

    // 5. Find existing local user or create new Codebase Doctor user
    let user = await prisma.user.findUnique({
      where: { githubId }
    });

    if (!user && userEmail) {
      // Check if user exists by verified email
      user = await prisma.user.findUnique({
        where: { email: userEmail }
      });
      if (user) {
        // Link existing user to githubId
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId,
            avatarUrl: ghUser.avatar_url || user.avatarUrl,
            name: ghUser.name || user.name
          }
        });
      }
    }

    if (!user) {
      // Create new Codebase Doctor User
      user = await prisma.user.create({
        data: {
          githubId,
          username: ghUser.login,
          name: ghUser.name || ghUser.login,
          email: userEmail || null,
          avatarUrl: ghUser.avatar_url,
          accessToken: accessToken,
          authProvider: 'github'
        }
      });
      console.log(`[OAuth Engine] Created new Codebase Doctor user: @${user.username} (${user.id})`);
    } else {
      // Update existing user profile & store latest access token
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: ghUser.login,
          name: ghUser.name || user.name,
          avatarUrl: ghUser.avatar_url || user.avatarUrl,
          accessToken: accessToken
        }
      });
      console.log(`[OAuth Engine] Authenticated existing user: @${user.username} (${user.id})`);
    }

    // 6. Establish Codebase Doctor authenticated session
    (req.session as any).user = user;

    // 7. Clean redirect to frontend dashboard (No tokens in URL)
    console.log('[OAuth Engine] Successfully authenticated user. Redirecting to dashboard...');
    res.redirect(`${config.frontendUrl}/dashboard`);
  } catch (err: any) {
    console.error('[OAuth Engine] Fatal GitHub callback error:', err.message);
    res.redirect(`${config.frontendUrl}/login?error=github_auth_failed`);
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

async function getOrCreateDemoUser() {
  return await prisma.user.upsert({
    where: { githubId: 'demo-user-100' },
    update: {},
    create: {
      githubId: 'demo-user-100',
      username: 'dev-architect',
      name: 'Senior Dev Architect',
      email: 'demo@codebasedoctor.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      accessToken: 'demo_token'
    }
  });
}

export default router;
