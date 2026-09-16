# Codebase Doctor 🩺

> An AI-powered software maintenance platform that analyzes GitHub repositories and generates automated Software Health Reports with prioritized repair plans and AI-assisted code fix diffs.

---

## 🚀 Key Features

- 🔒 **Multi-Category Static Analysis Engine**: Scans codebases across 7 quality categories:
  - **Security**: Hardcoded AWS/GitHub secrets, private keys, TLS validation bypass, SQL injection.
  - **Performance**: Async calls inside loops (N+1 query risks), synchronous file system I/O, unbounded queries.
  - **Architecture**: Monolithic files (>400 lines), deep block nesting (>5 indentation levels), unhandled Express async routes.
  - **Dependencies**: Missing lockfiles (`package-lock.json`), unpinned major packages, deprecated libraries (`request`, `moment`).
  - **Testing**: Test-to-source file coverage ratios, test runner configuration presence.
  - **Docker Quality**: Hadolint best practice rules (root user risks, unpinned base image tags, layer caching).
  - **Cloud Readiness**: Kubernetes/Docker-Compose health check probes, container resource limits, health endpoints.
- 📊 **Software Health Score**: 0–100 overall health score calculation with weighted category breakdowns and letter grades (A+, A, B, C, F).
- 🤖 **AI Explanation & Code Repair**: Formats findings for Anthropic Messages API (`LLM_API_KEY`) with an automatic fallback engine for zero-setup demo environments.
- 🎨 **Dark Developer-Tool Aesthetic**: Built with React, Vite, Tailwind CSS, Framer Motion, Recharts, and JetBrains Mono code typography.
- 📈 **Score Trend History**: Tracks past scans per repository to visualize quality improvement over time.
- ⚡ **Zero-Config Demo Mode**: Out-of-the-box pre-seeded sample projects and instant scanning capabilities without requiring live GitHub OAuth or LLM API keys.

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, React Router
- **Backend**: Node.js + Express + TypeScript, Prisma ORM, simple-git
- **Database**: SQLite (via Prisma ORM, configurable for PostgreSQL)
- **AI Integration**: Anthropic Messages API (`https://api.anthropic.com/v1/messages`) with local rule engine fallback

---

## 📁 Monorepo Structure

```
Codebase Doctor/
├── client/                     # Vite + React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # RadialGauge, CategoryCharts, IssueList, CodeDiffViewer
│   │   ├── context/            # AuthContext, ScanContext
│   │   ├── pages/              # DashboardPage, HistoryPage
│   │   ├── services/           # Axios API client
│   │   └── types/              # Client TypeScript definitions
│   └── vite.config.ts
├── server/                     # Express + Node.js + Prisma ORM
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (User, ConnectedRepo, Scan, Issue)
│   ├── src/
│   │   ├── analyzers/          # 7 static analysis modules
│   │   ├── routes/             # Auth, Repo, Scan, Health APIs
│   │   ├── services/           # gitService, aiService
│   │   ├── utils/              # scoreCalculator
│   │   ├── index.ts            # Server entrypoint
│   │   └── seed.ts             # Initial database seeder
└── package.json                # Root scripts (npm run dev via concurrently)
```

---

## 📦 Setup & Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Environment Setup
Copy `.env.example` files in both root and server directories:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Environment Variables:
- `PORT`: Express server port (default `5000`)
- `DATABASE_URL`: SQLite connection string (`file:./dev.db`)
- `GITHUB_CLIENT_ID`: GitHub OAuth App Client ID (optional in Demo Mode)
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret (optional in Demo Mode)
- `LLM_API_KEY`: Anthropic API Key (optional — fallback engine runs automatically if empty)
- `DEMO_MODE`: Set to `true` to enable out-of-the-box demo functionality

### 3. Install Dependencies & Seed Database

```bash
# Install all dependencies across monorepo
npm run install:all

# Synchronize Prisma database schema & seed initial sample repositories
npm run prisma:db:push
npm run seed
```

### 4. Launch Development Server

```bash
# Starts both Express server (port 5000) and Vite React client (port 5173) concurrently
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Verification & Build Commands

```bash
# Verify Server Build
npm run build --prefix server

# Verify Client Build
npm run build --prefix client
```
