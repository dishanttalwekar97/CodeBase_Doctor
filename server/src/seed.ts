import { prisma } from './db';

async function seed() {
  console.log('[Seed] Seeding Codebase Doctor demo repositories and initial scans...');

  // 1. Upsert Demo User
  const user = await prisma.user.upsert({
    where: { githubId: 'demo-user-100' },
    update: {},
    create: {
      githubId: 'demo-user-100',
      username: 'dev-architect',
      name: 'Senior Dev Architect',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      accessToken: 'demo_token'
    }
  });

  // 2. Sample Repositories
  const sampleRepos = [
    {
      owner: 'expressjs',
      name: 'express',
      url: 'https://github.com/expressjs/express',
      defaultBranch: 'master',
      userId: user.id
    },
    {
      owner: 'vercel',
      name: 'next.js',
      url: 'https://github.com/vercel/next.js',
      defaultBranch: 'canary',
      userId: user.id
    },
    {
      owner: 'facebook',
      name: 'react',
      url: 'https://github.com/facebook/react',
      defaultBranch: 'main',
      userId: user.id
    }
  ];

  for (const repoData of sampleRepos) {
    const repo = await prisma.connectedRepo.upsert({
      where: {
        owner_name: { owner: repoData.owner, name: repoData.name }
      },
      update: {},
      create: repoData
    });

    // Create 2 historical scans for trend view
    const scan1 = await prisma.scan.create({
      data: {
        repoId: repo.id,
        overallScore: 68,
        securityScore: 60,
        performanceScore: 75,
        architectureScore: 70,
        dependencyScore: 65,
        testingScore: 80,
        dockerScore: 50,
        cloudScore: 60,
        durationMs: 14200,
        commitHash: 'a1b2c3d4e5',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        issues: {
          create: [
            {
              category: 'SECURITY',
              title: 'Hardcoded Secret/Password Variable',
              description: 'Hardcoded secret or password literal assigned directly in code.',
              severity: 'IMPORTANT',
              filePath: 'src/config/jwt.js',
              lineNumber: 12,
              aiExplanation: 'Hardcoding secrets in source files exposes signing keys to all developers and version history.',
              beforeSnippet: 'const JWT_SECRET = "secret_password_123";',
              afterSnippet: 'const JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET) throw new Error("Missing JWT_SECRET");',
              impact: 'Enables environment isolation and secret rotation.',
              ruleId: 'SEC-004'
            },
            {
              category: 'DOCKER',
              title: 'Container Runs as Root User (Missing USER Directive)',
              description: 'Dockerfile lacks a non-root USER directive.',
              severity: 'CRITICAL',
              filePath: 'Dockerfile',
              lineNumber: 22,
              aiExplanation: 'Processes running as root inside containers can exploit kernel bugs to achieve root access on the host node.',
              beforeSnippet: 'FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nCMD ["node", "index.js"]',
              afterSnippet: 'FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nUSER node\nCMD ["node", "index.js"]',
              impact: 'Restricts container runtime process to non-privileged user.',
              ruleId: 'DOC-005'
            }
          ]
        }
      }
    });

    const scan2 = await prisma.scan.create({
      data: {
        repoId: repo.id,
        overallScore: 84,
        securityScore: 85,
        performanceScore: 88,
        architectureScore: 82,
        dependencyScore: 80,
        testingScore: 90,
        dockerScore: 80,
        cloudScore: 85,
        durationMs: 11800,
        commitHash: 'f9e8d7c6b5',
        status: 'COMPLETED',
        createdAt: new Date(),
        issues: {
          create: [
            {
              category: 'PERFORMANCE',
              title: 'Async/Await Call Inside Loop (N+1 Risk)',
              description: 'Executing sequential async network or database operations inside a loop.',
              severity: 'CRITICAL',
              filePath: 'src/controllers/userController.ts',
              lineNumber: 45,
              aiExplanation: 'Executing sequential database queries inside loop iterations multiplies network latency by N items.',
              beforeSnippet: 'for (const id of ids) {\n  const user = await prisma.user.findUnique({ where: { id } });\n  users.push(user);\n}',
              afterSnippet: 'const users = await prisma.user.findMany({\n  where: { id: { in: ids } }\n});',
              impact: 'Replaces N database calls with 1 batch query, reducing response latency by 85%.',
              ruleId: 'PERF-001'
            },
            {
              category: 'DEPENDENCIES',
              title: 'Deprecated Package Usage: request',
              description: 'The request library was officially deprecated in 2020.',
              severity: 'CRITICAL',
              filePath: 'package.json',
              lineNumber: 18,
              aiExplanation: 'The request package is unmaintained and contains unpatched security vulnerabilities.',
              beforeSnippet: '"request": "^2.88.2"',
              afterSnippet: '"axios": "^1.6.7"',
              impact: 'Eliminates security risk from unpatched HTTP client.',
              ruleId: 'DEP-003'
            },
            {
              category: 'CLOUD',
              title: 'Missing Container Healthcheck in Compose',
              description: 'docker-compose.yml service definitions lack a healthcheck stanza.',
              severity: 'IMPORTANT',
              filePath: 'docker-compose.yml',
              lineNumber: 1,
              aiExplanation: 'Orchestrators cannot verify service readiness without explicit health probes.',
              beforeSnippet: 'services:\n  web:\n    build: .',
              afterSnippet: 'services:\n  web:\n    build: .\n    healthcheck:\n      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]',
              impact: 'Enables zero-downtime rolling container updates.',
              ruleId: 'CLD-001'
            }
          ]
        }
      }
    });

    console.log(`[Seed] Created repo ${repo.owner}/${repo.name} with 2 scans.`);
  }

  console.log('[Seed] Database seeding completed successfully!');
}

seed()
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
