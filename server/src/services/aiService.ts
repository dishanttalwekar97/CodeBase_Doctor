import axios from 'axios';
import { RawFinding, AIEnhancedIssue } from '../types';
import { config } from '../config';

export async function enhanceFindingsWithAI(findings: RawFinding[]): Promise<AIEnhancedIssue[]> {
  if (!findings || findings.length === 0) {
    return [];
  }

  // If LLM_API_KEY is available, call Universal LLM API (Gemini / Groq / Anthropic / OpenAI)
  if (config.llmApiKey && config.llmApiKey.trim().length > 0) {
    try {
      console.log(`[AI Service] Calling LLM Provider API for ${findings.length} findings...`);
      return await callLLMProvider(findings);
    } catch (err: any) {
      console.error(`[AI Service] LLM API call failed (${err.message}). Falling back to local AI engine.`);
    }
  } else {
    console.log(`[AI Service] LLM_API_KEY not configured. Utilizing local AI explanation & fix generator engine.`);
  }

  // Fallback / Demo AI Generator Engine
  return findings.map(finding => generateFallbackAIFix(finding));
}

export async function callUniversalLLM(prompt: string): Promise<string> {
  const apiKey = config.llmApiKey.trim();
  if (!apiKey) throw new Error('No LLM API Key configured in server .env');

  // 1. Google Gemini API (100% Free) - Key starts with AIza... or AQ... or gemini_...
  if (apiKey.startsWith('AIza') || apiKey.startsWith('AQ') || apiKey.startsWith('gemini_')) {
    console.log('[Universal LLM Engine] Routing request to Google Gemini API (Free Tier)...');
    const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-lite'];
    for (const model of geminiModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await axios.post(url, {
          contents: [{ parts: [{ text: prompt }] }]
        }, { timeout: 15000 });
        const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text && text.trim().length > 0) {
          console.log(`[Gemini Engine] Successfully generated response using model: ${model}`);
          return text;
        }
      } catch (err: any) {
        const errMsg = err.response?.data?.error?.message || err.message;
        console.warn(`[Gemini Engine] Model ${model} returned: ${errMsg}`);
      }
    }
  }

  // 2. Groq API (100% Free) - Key starts with gsk_...
  if (apiKey.startsWith('gsk_')) {
    console.log('[Universal LLM Engine] Routing request to Groq Llama3 API (Free Tier)...');
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 25000
    });
    return res.data.choices?.[0]?.message?.content || '';
  }

  // 3. OpenRouter API - Key starts with sk-or-
  if (apiKey.startsWith('sk-or-')) {
    console.log('[Universal LLM Engine] Routing request to OpenRouter API...');
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 25000
    });
    return res.data.choices?.[0]?.message?.content || '';
  }

  // 4. Anthropic Messages API - Key starts with sk-ant-
  if (apiKey.startsWith('sk-ant-')) {
    console.log('[Universal LLM Engine] Routing request to Anthropic Claude 3.5 API...');
    const res = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      timeout: 25000
    });
    return res.data.content?.[0]?.text || '';
  }

  // 5. Default OpenAI API (Key starts with sk- or sk-proj- or any standard format)
  console.log('[Universal LLM Engine] Routing request to OpenAI API...');
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 25000
  });
  return res.data.choices?.[0]?.message?.content || '';
}

async function callLLMProvider(findings: RawFinding[]): Promise<AIEnhancedIssue[]> {
  const prompt = `You are an expert Principal Software Architect and Security Specialist reviewing static analysis findings for a codebase.
Analyze the following list of raw static analysis findings and return a valid JSON array where each element contains:
- "ruleId": exact matching ruleId from input
- "aiExplanation": A clear, 2-3 sentence technical explanation of why this issue occurs, its risk, and best practices.
- "beforeSnippet": The problematic code snippet demonstrating the issue.
- "afterSnippet": The corrected, production-ready repaired code snippet.
- "impact": A 1-sentence summary of the security/performance gain after applying this fix.

Raw Findings to process:
${JSON.stringify(findings, null, 2)}

Respond strictly with a raw JSON array of objects without markdown codeblock formatting or extra text.`;

  const textOutput = await callUniversalLLM(prompt);
  const cleanJson = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const parsedAI: Array<{
    ruleId: string;
    aiExplanation: string;
    beforeSnippet: string;
    afterSnippet: string;
    impact: string;
  }> = JSON.parse(cleanJson);

  return findings.map(finding => {
    const aiItem = parsedAI.find(item => item.ruleId === finding.ruleId);
    if (aiItem) {
      return {
        ...finding,
        aiExplanation: aiItem.aiExplanation,
        beforeSnippet: aiItem.beforeSnippet || finding.contextCode || '// Unspecified code snippet',
        afterSnippet: aiItem.afterSnippet || '// Repaired code snippet',
        impact: aiItem.impact || 'Improves software health score and security posture.'
      };
    }
    return generateFallbackAIFix(finding);
  });
}

function generateFallbackAIFix(finding: RawFinding): AIEnhancedIssue {
  let beforeSnippet = finding.contextCode ? String(finding.contextCode) : `// Issue in ${finding.filePath}:${finding.lineNumber || 1}`;
  let afterSnippet = '// Repaired code snippet';
  let aiExplanation = finding.description ? String(finding.description) : 'Issue identified during automated static repository analysis.';
  let impact = 'Enhances overall system stability, performance, and code maintainability.';

  switch (finding.ruleId) {
    case 'SEC-001':
      beforeSnippet = `const awsAccessKey = "AKIA1234567890ABCDEF";\nconst s3 = new AWS.S3({ accessKeyId: awsAccessKey });`;
      afterSnippet = `// Use environment variables or AWS IAM Roles\nconst awsAccessKey = process.env.AWS_ACCESS_KEY_ID;\nif (!awsAccessKey) throw new Error("AWS_ACCESS_KEY_ID is required");\nconst s3 = new AWS.S3({ accessKeyId: awsAccessKey });`;
      aiExplanation = `Hardcoding cloud credentials directly in repository source files exposes your AWS infrastructure to unauthorized access and automated secret scraping bots.`;
      impact = `Eliminates credential leak vectors and aligns with AWS security best practices.`;
      break;

    case 'SEC-002':
      beforeSnippet = `const octokit = new Octokit({ auth: "ghp_1234567890abcdefghijklmnopqrstuv" });`;
      afterSnippet = `const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });`;
      aiExplanation = `GitHub Personal Access Tokens grant repository read/write access. Hardcoding tokens compromises access control across your organization.`;
      impact = `Secures API token authorization management via environment variables.`;
      break;

    case 'SEC-004':
      beforeSnippet = `const JWT_SECRET = "super_secret_jwt_password_123";\nconst token = jwt.sign(payload, JWT_SECRET);`;
      afterSnippet = `const JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET) throw new Error("JWT_SECRET must be configured");\nconst token = jwt.sign(payload, JWT_SECRET);`;
      aiExplanation = `Hardcoded secrets in source files prevent key rotation and expose sensitive token signing keys across non-production environments.`;
      impact = `Enables zero-trust secret rotation and env-specific secret management.`;
      break;

    case 'SEC-006':
      beforeSnippet = `const agent = new https.Agent({ rejectUnauthorized: false });`;
      afterSnippet = `// Ensure proper CA certificate chain validation\nconst agent = new https.Agent({ rejectUnauthorized: true });`;
      aiExplanation = `Disabling SSL/TLS certificate verification allows network attackers to intercept and alter API traffic using Man-In-The-Middle (MITM) techniques.`;
      impact = `Restores strict end-to-end TLS encryption and identity verification.`;
      break;

    case 'PERF-001':
      beforeSnippet = `for (const id of userIds) {\n  const user = await prisma.user.findUnique({ where: { id } });\n  users.push(user);\n}`;
      afterSnippet = `// Batch database query using SQL IN clause\nconst users = await prisma.user.findMany({\n  where: { id: { in: userIds } }\n});`;
      aiExplanation = `Invoking database queries inside a loop creates an N+1 query pattern, resulting in redundant network roundtrips and high database latency.`;
      impact = `Reduces query latency from O(N) database calls down to O(1) single batch request.`;
      break;

    case 'PERF-002':
      beforeSnippet = `app.get("/api/config", (req, res) => {\n  const data = fs.readFileSync("./config.json", "utf8");\n  res.json(JSON.parse(data));\n});`;
      afterSnippet = `app.get("/api/config", async (req, res, next) => {\n  try {\n    const data = await fs.promises.readFile("./config.json", "utf8");\n    res.json(JSON.parse(data));\n  } catch (err) { next(err); }\n});`;
      aiExplanation = `Synchronous file system methods block Node's single-threaded event loop, freezing all concurrent incoming web requests while disk I/O completes.`;
      impact = `Unblocks Node.js event loop, increasing server concurrent request throughput.`;
      break;

    case 'ARCH-001':
      beforeSnippet = `// Monolithic 600+ line controller file containing business logic,\n// database calls, validation, and email formatting all in one file.`;
      afterSnippet = `// Refactor into modular architecture:\n// 1. /services/userService.ts (business logic)\n// 2. /validators/userValidator.ts (input validation)\n// 3. /controllers/userController.ts (HTTP route handling)`;
      aiExplanation = `Single source files with hundreds of lines violate the Single Responsibility Principle, making code difficult to unit-test and prone to merge conflicts.`;
      impact = `Improves module separation of concerns, testability, and team dev velocity.`;
      break;

    case 'ARCH-002':
      beforeSnippet = finding.contextCode ? String(finding.contextCode) : `// Deeply nested block in ${finding.filePath}:${finding.lineNumber || 1}`;
      afterSnippet = `// Refactor nested conditionals into modular helper functions\nconst isValidState = (data) => Boolean(data && data.active);\nif (isValidState(item)) {\n  processItem(item);\n}`;
      aiExplanation = `Deeply nested code blocks (cyclomatic complexity) reduce code readability, make debugging harder, and increase risk of unexpected logic bugs.`;
      impact = `Reduces cyclomatic complexity and simplifies unit testing.`;
      break;

    case 'DEP-001':
      beforeSnippet = `// package.json exists\n// package-lock.json (MISSING)`;
      afterSnippet = `// Generate deterministic lockfile\n$ npm install --package-lock-only`;
      aiExplanation = `Without a lockfile, subsequent \`npm install\` runs in CI/CD or production may pull minor/patch dependency updates containing unexpected bugs.`;
      impact = `Guarantees 100% reproducible builds across development, staging, and production.`;
      break;

    case 'DEP-002':
      beforeSnippet = `"dependencies": {\n  "express": "*",\n  "lodash": "latest"\n}`;
      afterSnippet = `"dependencies": {\n  "express": "^4.18.2",\n  "lodash": "^4.17.21"\n}`;
      aiExplanation = `Wildcard dependency specifications auto-upgrade to breaking major versions on reinstall, introducing sudden production outages.`;
      impact = `Prevents unvetted dependency upgrades from breaking application runtime.`;
      break;

    case 'DEP-003':
      beforeSnippet = `const request = require('request');\nrequest('https://api.example.com', (err, res, body) => { ... });`;
      afterSnippet = `import axios from 'axios';\nconst response = await axios.get('https://api.example.com');`;
      aiExplanation = `The \`request\` npm package was officially sunsetted and deprecated. It receives no security patches or performance improvements.`;
      impact = `Removes unpatched vulnerability vectors and modernizes HTTP client architecture.`;
      break;

    case 'DOC-005':
      beforeSnippet = `FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nCMD ["node", "server.js"]`;
      afterSnippet = `FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nUSER node\nCMD ["node", "server.js"]`;
      aiExplanation = `Containers executing as root inherit host-level privileges if a process escape vulnerability is exploited in containerized runtimes.`;
      impact = `Enforces least-privilege security model inside containerized runtime.`;
      break;

    case 'CLD-001':
      beforeSnippet = `services:\n  api:\n    build: .\n    ports:\n      - "5000:5000"`;
      afterSnippet = `services:\n  api:\n    build: .\n    ports:\n      - "5000:5000"\n    healthcheck:\n      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]\n      interval: 30s\n      timeout: 10s\n      retries: 3`;
      aiExplanation = `Docker Compose services without a healthcheck block cannot communicate container readiness status to orchestrators or dependent services.`;
      impact = `Enables automated zero-downtime rolling deployments and container auto-healing.`;
      break;

    case 'TST-001':
      beforeSnippet = `// No test files detected in repository src/ or __tests__/ directory`;
      afterSnippet = `// Create src/index.test.ts\nimport { describe, it, expect } from 'vitest';\ndescribe('Core App', () => {\n  it('should pass health check', () => {\n    expect(true).toBe(true);\n  });\n});`;
      aiExplanation = `A codebase with zero automated unit tests relies entirely on manual regression testing, leading to frequent production regressions.`;
      impact = `Establishes safety net for continuous integration and safe code refactoring.`;
      break;
  }

  return {
    ...finding,
    aiExplanation,
    beforeSnippet,
    afterSnippet,
    impact
  };
}
