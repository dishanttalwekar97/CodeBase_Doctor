import { Router } from 'express';
import { config } from '../config';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Codebase Doctor API Engine',
    timestamp: new Date().toISOString(),
    demoMode: config.demoMode,
    llmConfigured: Boolean(config.llmApiKey)
  });
});

export default router;
