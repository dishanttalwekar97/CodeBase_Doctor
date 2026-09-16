import { Router } from 'express';
import { prisma } from '../db';
import { cloneRepo } from '../services/gitService';
import { runFullAnalysis } from '../services/analyzers';
import { calculateScores } from '../utils/scoreCalculator';
import { enhanceFindingsWithAI } from '../services/aiService';

const router = Router();

// POST /api/webhooks/github - Receive GitHub Webhooks (push, pull_request)
router.post('/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  console.log(`[GitHub Webhook Engine] Received GitHub Webhook Event: ${event}`);

  // Acknowledge webhook immediately to prevent GitHub timeout
  res.status(202).json({ received: true, event });

  if (event === 'push' || event === 'pull_request') {
    const repository = req.body?.repository;
    if (!repository) return;

    const owner = repository.owner?.login || repository.owner?.name;
    const name = repository.name;
    const repoUrl = repository.html_url || `https://github.com/${owner}/${name}`;

    if (!owner || !name) return;

    console.log(`[GitHub Webhook Engine] Processing automated audit trigger for ${owner}/${name}...`);

    try {
      let repo = await prisma.connectedRepo.findFirst({
        where: { owner, name }
      });

      if (!repo) {
        repo = await prisma.connectedRepo.create({
          data: {
            url: repoUrl,
            owner,
            name
          }
        });
      }

      const startTime = Date.now();
      const { targetDir, commitHash, cleanup } = await cloneRepo(repoUrl);

      try {
        const rawFindings = await runFullAnalysis(targetDir);
        const { overallScore, categoryScores } = calculateScores(rawFindings);
        const aiEnhancedIssues = await enhanceFindingsWithAI(rawFindings);
        const durationMs = Date.now() - startTime;

        const scan = await prisma.scan.create({
          data: {
            repoId: repo.id,
            overallScore,
            securityScore: categoryScores.securityScore,
            performanceScore: categoryScores.performanceScore,
            architectureScore: categoryScores.architectureScore,
            dependencyScore: categoryScores.dependencyScore,
            testingScore: categoryScores.testingScore,
            dockerScore: categoryScores.dockerScore,
            cloudScore: categoryScores.cloudScore,
            durationMs,
            commitHash: commitHash || req.body.after?.slice(0, 7) || 'webhook',
            status: 'COMPLETED',
            issues: {
              create: aiEnhancedIssues.map(issue => ({
                category: issue.category,
                title: String(issue.title),
                description: String(issue.description),
                severity: issue.severity,
                filePath: String(issue.filePath),
                lineNumber: issue.lineNumber || null,
                aiExplanation: String(issue.aiExplanation),
                beforeSnippet: issue.beforeSnippet ? String(issue.beforeSnippet) : null,
                afterSnippet: issue.afterSnippet ? String(issue.afterSnippet) : null,
                impact: issue.impact ? String(issue.impact) : null,
                ruleId: issue.ruleId ? String(issue.ruleId) : null
              }))
            }
          }
        });

        console.log(`[GitHub Webhook Engine] Completed automated scan #${scan.id} for ${owner}/${name}. Score: ${overallScore}/100.`);
      } finally {
        await cleanup();
      }
    } catch (err: any) {
      console.error('[GitHub Webhook Engine] Automated scan failed:', err.message);
    }
  }
});

export default router;
