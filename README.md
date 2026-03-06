# InsightIQ

A qualitative research platform powered by AI. Generate interview questions, manage transcripts, synthesize insights, build user personas, and chat with your research data — all in the browser, with no backend required.

---

## Features

- **Projects** — Organize research into projects with topic, goals, and target audience
- **Questions** — AI-generated discussion guides with Opening / Core / Closing sections
- **Transcripts** — Paste and manage interview transcripts
- **Insights** — Synthesize transcripts into themes, key insights, verbatims, and recommendations
- **Personas** — Generate data-driven UX personas from your interviews
- **Ask InsightIQ** — Chat with your research data via a streaming AI assistant

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| Font | JetBrains Mono |
| AI | Anthropic Claude / OpenAI GPT-4o |
| Storage | Browser localStorage (no backend) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Add your API key

Click the **API key button** in the top-right corner of the app. From there you can:

- Choose between **Claude** (Anthropic) or **OpenAI** as your AI provider
- Paste your API key
- Optionally set a **custom Target URL** (for proxies or custom deployments)

Keys are stored in your browser's localStorage — they never leave your machine except to call the AI provider directly.

---

## Environment Variables (optional)

You can pre-configure keys via a `.env` file instead of entering them in the UI:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_OPENAI_API_KEY=sk-proj-...
```

Create a `.env` file in the project root. Keys set here are used as fallbacks if no key is saved in the browser.

> **Never commit `.env` to git.** It is already listed in `.gitignore`.

---

## Build for Production

```bash
npm run build
```

Output is in `dist/`. Serve it with any static file host (Vercel, Netlify, GitHub Pages, nginx, etc.).

```bash
npm run preview   # preview the production build locally
```

### Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys automatically on every push to `main`.

**One-time setup in your GitHub repository:**

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow runs automatically and your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

> The app uses `HashRouter` so all routes work correctly on GitHub Pages without any server configuration (URLs look like `https://you.github.io/repo/#/projects/123`).

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx        # Top bar with API key / provider settings
│   │   ├── Sidebar.jsx       # Project navigation
│   │   └── ProjectLayout.jsx # Shell for project pages
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       ├── Input.jsx
│       ├── Tabs.jsx
│       ├── Spinner.jsx
│       └── Toast.jsx
├── hooks/
│   ├── useClaude.js          # AI streaming (Claude + OpenAI), key/URL management
│   └── useProjects.js        # Project CRUD with localStorage
├── lib/
│   ├── prompts.js            # AI prompt builders
│   ├── storage.js            # localStorage helpers
│   └── utils.js              # formatDate, classNames, etc.
└── pages/
    ├── Home.jsx
    ├── NewProject.jsx
    ├── ProjectOverview.jsx
    ├── Questions.jsx
    ├── Transcripts.jsx
    ├── Insights.jsx
    ├── Personas.jsx
    └── Ask.jsx
```

---

## AI Provider Support

### Anthropic Claude
- Model: `claude-sonnet-4-6`
- Default endpoint: `https://api.anthropic.com/v1/messages`
- Get a key: [console.anthropic.com](https://console.anthropic.com/settings/keys)

### OpenAI
- Model: `gpt-4o`
- Default endpoint: `https://api.openai.com/v1/chat/completions`
- Get a key: [platform.openai.com](https://platform.openai.com/api-keys)

Both providers support a **custom Target URL** for routing through proxies, Azure OpenAI endpoints, or locally hosted models that are API-compatible.

---

## Data & Privacy

- All project data (transcripts, questions, insights, personas) is stored in **browser localStorage only**
- API keys are stored in localStorage and sent directly to the AI provider — no intermediary server
- Clearing browser data will erase all projects and settings

---

## License

MIT
