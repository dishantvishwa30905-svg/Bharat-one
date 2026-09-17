# 🇮🇳 Bharat One

[![CI Pipeline](https://github.com/dishantvishwa30905-svg/Bharat-one/actions/workflows/ci.yml/badge.svg)](https://github.com/dishantvishwa30905-svg/Bharat-one/actions/workflows/ci.yml)

**One Platform. Every Scheme. Your Benefits.**

Repository: [https://github.com/dishantvishwa30905-svg/Bharat-one](https://github.com/dishantvishwa30905-svg/Bharat-one)

Bharat One is an independent informational platform that helps Indian citizens discover government schemes, check indicative eligibility, and find official application information — all in one place.

> ⚠️ Bharat One is an **independent informational platform** and is **NOT** an official government website. Final eligibility and approval are determined by the respective government authority.

---

## 🚀 Features

- **Scheme Discovery** — Browse 20+ real government schemes across 15+ categories
- **Rule-Based Eligibility Engine** — Dynamic AND/OR/NOT condition evaluation with match scoring and detailed reasons
- **Personalized Dashboard** — Profile completion tracker, top matches, application status
- **User Profile** — 15+ demographic/economic fields for accurate eligibility matching
- **Bookmarks** — Save and track schemes of interest
- **Application Tracker** — Self-report application status with reference numbers
- **Notifications** — In-app alerts for new schemes, deadlines, and profile reminders
- **Admin Panel** — Scheme management, analytics, and verification workflows
- **Multilingual** — English, Hindi (हिंदी), Marathi (मराठी)
- **Mobile Responsive** — Full PWA-ready responsive design
- **Secure Auth** — JWT + HTTP-only cookies, password hashing with bcrypt

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS with custom Bharat One brand tokens |
| Icons | Lucide React |
| Backend | Next.js API Routes (built-in) |
| Database | SQLite (dev) / PostgreSQL (production) |
| ORM | Prisma 5 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Fonts | Plus Jakarta Sans + Inter (Google Fonts) |

---

## 📦 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up database and seed data
npm run db:setup

# 3. Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Demo User (Rahul Sharma) | rahul@gmail.com | Rahul@123 |
| Admin | admin@bharatone.in | Admin@123 |
| Scheme Manager | manager@bharatone.in | Manager@123 |

---

## 🗄️ Database

### Local Development (SQLite)
The app uses SQLite by default — no setup required. Database file is at `prisma/dev.db`.

```bash
# Push schema changes
npm run db:push

# Re-seed demo data
npm run db:seed
```

### Production (PostgreSQL)
1. Update `.env` with your PostgreSQL `DATABASE_URL`
2. Update `prisma/schema.prisma` — change provider from `sqlite` to `postgresql`
3. Run `npx prisma migrate dev` to create migrations

---

## 🔑 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes (PostgreSQL in prod) |
| `JWT_SECRET` | JWT signing secret (change in production!) | Yes |
| `AUTH_SECRET` | Session encryption key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `EMAIL_API_KEY` | Email notification service key | Optional |
| `MAPS_API_KEY` | Google Maps API key (CSC locator) | Optional |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # All API routes
│   │   ├── auth/               # Register, Login, Logout, Me
│   │   ├── users/profile/      # User profile CRUD
│   │   ├── schemes/            # Scheme list, detail, eligibility
│   │   ├── eligibility/        # Recommendations engine
│   │   ├── bookmarks/          # Save/unsave schemes
│   │   ├── applications/       # Application tracker
│   │   ├── notifications/      # In-app notifications
│   │   ├── feedback/           # Report incorrect info
│   │   ├── admin/              # Admin analytics, scheme mgmt, rules
│   │   └── health/             # Health check
│   ├── admin/                  # Admin panel UI
│   ├── dashboard/              # User dashboard
│   ├── schemes/                # Scheme catalog + detail pages
│   ├── profile/                # User profile form
│   ├── bookmarks/              # Saved schemes
│   ├── applications/           # Application tracker
│   ├── notifications/          # Notification center
│   ├── settings/               # Language & account settings
│   ├── help/                   # FAQ & support
│   ├── login/                  # Login page
│   └── register/               # Registration page
├── components/
│   ├── layout/                 # Sidebar, Topbar, DashboardLayout
│   ├── scheme/                 # SchemeCard
│   └── ui/                     # Logo
└── lib/
    ├── auth.ts                 # JWT + password utilities
    ├── auth-context.tsx        # React auth state
    ├── db.ts                   # Prisma client singleton
    ├── engine.ts               # Eligibility rule evaluator
    └── i18n.tsx                # Language context
prisma/
├── schema.prisma               # Database schema
└── seed.js                     # Demo data seeder
locales/
├── en.json                     # English translations
├── hi.json                     # Hindi translations
└── mr.json                     # Marathi translations
```

---

## 🧠 Eligibility Engine

The engine (`src/lib/engine.ts`) evaluates nested logical conditions stored as JSON in the database:

```json
{
  "logical": "AND",
  "conditions": [
    { "field": "isStudent", "operator": "==", "value": true },
    { "field": "annualIncome", "operator": "<=", "value": 250000 },
    {
      "logical": "OR",
      "conditions": [
        { "field": "casteCategory", "operator": "==", "value": "SC" },
        { "field": "casteCategory", "operator": "==", "value": "ST" }
      ]
    }
  ]
}
```

**Supported operators:** `==`, `!=`, `>`, `<`, `>=`, `<=`, `IN`, `NOT IN`

**Output:**
- `Eligible` / `Not Eligible` / `Needs Verification`
- Match percentage (0–100%)
- Detailed satisfied/failed/missing criteria

---

## 🔒 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens stored in HTTP-only cookies (7-day expiry)
- Role-based access control (USER, SUPER_ADMIN, SCHEME_MANAGER, VERIFIER, SUPPORT_ADMIN)
- API routes validate session on every request
- Security headers via Next.js config
- No secrets in source code — use `.env`

---

---

## ☁️ Deployment & CI/CD Pipeline

### 🤖 Automated CI Pipeline (GitHub Actions)
The repository includes a automated GitHub Actions workflow (`.github/workflows/ci.yml`) triggered on `push` and `pull_request` to `main`:
- **Node.js Environment**: Node 20 with `npm` cache.
- **Verification Steps**:
  1. `npm ci` — Clean dependency installation.
  2. `npx prisma generate` — Prisma client generation.
  3. `npm run lint` — Code linting.
  4. `npx tsc --noEmit` — Typechecking.
  5. `npm run build` — Next.js production build validation.

---

### 🌐 Vercel Automated Deployment

#### Manual Linking Instructions:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
2. Import the GitHub repository: `dishantvishwa30905-svg/Bharat-one`.
3. Select **Next.js** as Framework Preset (`vercel.json` will automatically configure build overrides).
4. Configure Environment Variables in Vercel settings (separate values for **Preview** and **Production**).
5. Click **Deploy**.

#### Environment Variables to Set in Vercel:

| Variable Name | Required | Description | Example (Development / Production) |
|---|---|---|---|
| `DATABASE_URL` | Yes | SQLite / PostgreSQL connection string | `file:./dev.db` (or PostgreSQL URI) |
| `JWT_SECRET` | Yes | Secure random string for JWT signing | `your-secure-jwt-signing-secret` |
| `AUTH_SECRET` | Yes | Session encryption key | `your-session-encryption-auth-secret` |
| `PORT` | No | App port (default: 3000) | `3000` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret | `your-google-client-secret` |

#### Continuous Deployment Behavior:
- **Pull Requests (PRs)**: Automatically create **Vercel Preview Deployments** with unique URLs for live testing.
- **Merges to `main`**: Automatically trigger **Vercel Production Deployments**.

---

### 🔒 Recommended GitHub Branch Protection Rules for `main`

To enforce code quality and prevent unauthorized direct pushes to `main`, apply the following settings in GitHub (**Settings > Branches > Add branch protection rule**):

1. **Branch name pattern**: `main`
2. **Require a pull request before merging**:
   - Check **Require approvals** (Minimum: 1 approval).
   - Check **Dismiss stale pull request approvals when new commits are pushed**.
3. **Require status checks to pass before merging**:
   - Check **Require branches to be up to date before merging**.
   - Search & select status check: `Build & Test` (from GitHub Actions).
4. **Block force pushes**:
   - Check **Do not allow bypassing the above settings**.
   - Check **Restrict who can push to matching branches**.

---

## 📊 Seeded Data

The demo database includes:
- **20 real government schemes** with official URLs and verified eligibility rules
- **3 user accounts** (User, Admin, Manager)
- **8 bookmarks** for demo user
- **3 application trackers** for demo user
- **3 notifications** for demo user

Schemes cover: Agriculture, Healthcare, Education, Scholarships, Housing, Employment, Skill Development, Women & Child, Social Security, Pension, Entrepreneurship, MSME

---

## 🌐 Multilingual Support

Languages: English 🇮🇳 | Hindi हिंदी | Marathi मराठी

- Translation files: `/locales/{en|hi|mr}.json`
- Language preference saved in `localStorage`
- Switch language via Settings page or navbar

---

## 📝 License

This project is for educational and informational purposes only. All government scheme information is sourced from official portals and is provided for reference only. Bharat One is not affiliated with any government body.

---

## 🔄 GitHub Auto-Synchronization

This repository is equipped with an automated sync watcher (`scripts/auto-sync.js`):
- Automatically detects changes across the project.
- Safely debounces commits so batch edits are cleanly consolidated.
- Protects `.env` and sensitive credentials from ever being committed.
- Automatically commits and pushes to `origin/main`.
- Can be started via `start-sync.bat` and stopped via `stop-sync.bat`.

---

*Made with ❤️ for 🇮🇳 Bharat — One Platform. Every Scheme. Your Benefits.*
