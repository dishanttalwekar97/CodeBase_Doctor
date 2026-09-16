import { Router } from 'express';
import axios from 'axios';
import { prisma } from '../db';
import { config } from '../config';

const router = Router();

// GET /api/repos/user-github-repos - Fetch authenticated user's GitHub repositories
router.get('/user-github-repos', async (req, res) => {
  try {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      return res.status(401).json({ error: 'Unauthorized. Please log in first.', repos: [] });
    }

    let accessToken = sessionUser.accessToken;
    const username = sessionUser.username;

    // Fetch latest user record from DB to get accessToken if not in session object
    if (!accessToken && sessionUser.id) {
      const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
      accessToken = dbUser?.accessToken;
    }

    let rawRepos: any[] = [];
    if (accessToken) {
      console.log(`[GitHub API] Fetching repositories for authenticated user @${username}...`);
      const response = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      rawRepos = response.data;
    } else if (username && username !== 'dev-architect') {
      console.log(`[GitHub API] Fetching public repositories for user @${username}...`);
      const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      rawRepos = response.data;
    }

    const formattedRepos = (Array.isArray(rawRepos) ? rawRepos : []).map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login,
      htmlUrl: r.html_url,
      description: r.description,
      defaultBranch: r.default_branch || 'main',
      isPrivate: r.private || false,
      stars: r.stargazers_count || 0,
      language: r.language || 'TypeScript'
    }));

    res.json(formattedRepos);
  } catch (err: any) {
    console.error('Failed to fetch user GitHub repos:', err.message);
    res.status(500).json({ error: 'Failed to fetch repositories from GitHub: ' + err.message, repos: [] });
  }
});

// List connected repositories
router.get('/', async (req, res) => {
  try {
    const repos = await prisma.connectedRepo.findMany({
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(repos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic GitHub README SVG Health Badge Endpoint
router.get('/badge/:owner/:name.svg', async (req, res) => {
  const { owner, name } = req.params;
  try {
    const repo = await prisma.connectedRepo.findFirst({
      where: { owner, name },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const score = repo?.scans?.[0]?.overallScore ?? 75;

    let badgeColor = '#EF4444'; // Red
    let grade = 'F';
    if (score >= 90) { badgeColor = '#10B981'; grade = 'A+'; }
    else if (score >= 80) { badgeColor = '#22D3EE'; grade = 'A'; }
    else if (score >= 70) { badgeColor = '#6366F1'; grade = 'B'; }
    else if (score >= 50) { badgeColor = '#F59E0B'; grade = 'C'; }

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" role="img" aria-label="Codebase Doctor: ${score}/100">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="220" height="28" rx="6" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <rect width="135" height="28" fill="#161B26"/>
    <rect x="135" width="85" height="28" fill="${badgeColor}"/>
    <rect width="220" height="28" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="JetBrains Mono,Inter,Verdana,sans-serif" font-size="11">
    <text x="68" y="18" fill="#E5E7EB">codebase doctor</text>
    <text x="177" y="18" font-weight="bold">${score} / 100 (${grade})</text>
  </g>
</svg>
`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(svg.trim());
  } catch {
    res.status(500).send('Error generating badge');
  }
});

// Connect a new repository URL
router.post('/connect', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid repository URL is required' });
  }

  let owner = '';
  let name = '';

  const cleanUrl = url.trim().replace(/\/$/, '');
  const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

  if (match) {
    owner = match[1];
    name = match[2].replace(/\.git$/, '');
  } else if (cleanUrl.split('/').length === 2) {
    const parts = cleanUrl.split('/');
    owner = parts[0];
    name = parts[1];
  } else {
    return res.status(400).json({ error: 'Invalid GitHub URL format. Use https://github.com/owner/repo format.' });
  }

  const normalizedUrl = `https://github.com/${owner}/${name}`;

  try {
    const sessionUser = (req.session as any)?.user;
    let userId = sessionUser?.id;

    if (!userId && config.demoMode) {
      const demoUser = await prisma.user.findUnique({ where: { githubId: 'demo-user-100' } });
      userId = demoUser?.id;
    }

    const repo = await prisma.connectedRepo.upsert({
      where: {
        owner_name: { owner, name }
      },
      update: {
        url: normalizedUrl,
        updatedAt: new Date()
      },
      create: {
        url: normalizedUrl,
        owner,
        name,
        defaultBranch: 'main',
        userId
      },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    res.json(repo);
  } catch (err: any) {
    console.error('Connect repo error:', err);
    res.status(500).json({ error: 'Failed to connect repository: ' + err.message });
  }
});

export default router;
