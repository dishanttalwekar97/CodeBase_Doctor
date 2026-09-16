import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './routes/auth';
import repoRoutes from './routes/repo';
import scanRoutes from './routes/scan';
import healthRoutes from './routes/health';
import webhookRoutes from './routes/webhook';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Production API Rate Limiters
const scanRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 scan runs per 15 minutes
  message: { error: 'Too many scans initiated from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const aiChatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 AI chat requests per 5 minutes
  message: { error: 'AI Assistant rate limit reached. Please wait a few minutes before asking more questions.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Express Session
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Register API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/scans/run', scanRateLimiter);
app.use('/api/scans/chat', aiChatLimiter);
app.use('/api/scans', scanRoutes);
app.use('/api/webhooks', webhookRoutes);

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🩺 Codebase Doctor API Server running on port ${config.port}`);
  console.log(`📍 Environment: Demo Mode = ${config.demoMode}`);
  console.log(`🤖 LLM API Key Configured: ${Boolean(config.llmApiKey)}`);
  console.log(`=======================================================`);
});

