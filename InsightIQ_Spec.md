# InsightIQ — Product Specification
**Version:** 1.0  
**For:** Claude Code Build  
**UI Direction:** Clean, minimal, refined — think Notion meets Linear

---

## 1. Overview

InsightIQ is an AI-powered qualitative research platform. It helps researchers create projects, auto-generate discussion questions, analyze transcripts, and surface insights, verbatims, and themes — all within a per-project workspace that also supports a Q&A assistant grounded in research notes.

---

## 2. Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend/AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Storage:** localStorage (for MVP, no auth required)
- **Routing:** React Router
- **No UI component libraries** — build everything custom for full design control

---

## 3. Design System

### Philosophy
Clean, minimal, and purposeful. Every element earns its place. No clutter, no unnecessary decorations. Inspired by Linear and Notion — but warmer.

### Colors
```
Background:     #F9F8F6  (warm off-white)
Surface:        #FFFFFF
Border:         #E8E5E0
Text Primary:   #1A1916
Text Secondary: #6B6760
Accent:         #2D5BE3  (electric blue)
Accent Light:   #EEF2FD
Success:        #1A9E6E
Warning:        #E8860A
```

### Typography
- **Display/Headings:** `DM Serif Display` (Google Fonts)
- **Body/UI:** `DM Sans` (Google Fonts)
- Base size: 14px, Line height: 1.6

### Spacing
Use an 8px grid system throughout. Generous whitespace. Let content breathe.

### Components Style
- Buttons: Rounded (6px), subtle shadows, clear hover states
- Inputs: Borderless with bottom border only, or full border on focus
- Cards: White, 1px border `#E8E5E0`, 12px radius, subtle shadow
- No heavy gradients — use flat color with occasional very subtle gradient on CTAs

---

## 4. App Structure

```
/                        → Home / Projects Dashboard
/projects/new            → Create New Project
/projects/:id            → Project Workspace (main view)
/projects/:id/questions  → AI Question Generator
/projects/:id/transcripts → Upload & Manage Transcripts
/projects/:id/insights   → Insights, Themes & Verbatims
/projects/:id/ask        → Q&A Assistant
```

---

## 5. Pages & Features

---

### 5.1 Home — Projects Dashboard (`/`)

**Layout:** Top navbar + centered content area (max-width: 960px)

**Navbar:**
- Left: `InsightIQ` wordmark (DM Serif Display, 20px)
- Right: `+ New Project` button (accent color)

**Content:**
- Page heading: "Your Research Projects"
- Subtext: "Pick up where you left off, or start something new."
- Project cards grid (2 columns on desktop, 1 on mobile)

**Project Card contains:**
- Project name (bold)
- Topic/description (truncated, 2 lines)
- Created date
- Transcript count badge
- Status pill: `Active` / `Complete`
- On hover: subtle lift shadow
- Click → navigates to `/projects/:id`

**Empty state:**
- Centered illustration (simple SVG — magnifying glass or document icon)
- Heading: "No projects yet"
- Subtext: "Start by creating your first research project."
- CTA button: `Create Project`

---

### 5.2 Create New Project (`/projects/new`)

**Layout:** Centered form, max-width 560px, vertically centered on page

**Fields:**
- Project Name (text input, required)
- Research Topic (text input, required) — e.g. "Customer onboarding experience"
- Description (textarea, optional) — context about the research
- Target Audience (text input, optional) — e.g. "First-time SaaS users"
- Research Goal (textarea, optional) — what you want to learn

**CTA:** `Create Project` → saves to localStorage, redirects to `/projects/:id`

**Back link:** `← Back` top left

---

### 5.3 Project Workspace (`/projects/:id`)

**Layout:** Left sidebar (240px) + main content area

**Left Sidebar:**
- Project name at top (bold, truncated)
- Nav links:
  - 📋 Overview
  - 💬 Questions
  - 📄 Transcripts
  - 💡 Insights
  - 🔍 Ask InsightIQ
- At bottom: Project settings (rename, delete)

**Overview Page (default view):**
- Project name as H1
- Topic, description, goal shown as a clean summary card
- Stats row: `X Transcripts` · `X Questions` · `X Insights`
- Quick action cards:
  - "Generate Questions" → links to Questions tab
  - "Upload Transcript" → links to Transcripts tab
  - "View Insights" → links to Insights tab

---

### 5.4 AI Question Generator (`/projects/:id/questions`)

**Purpose:** Claude generates a set of interview/research questions based on the project topic and goal.

**UI:**
- Heading: "Discussion Questions"
- Subtext: "AI-generated questions tailored to your research topic."
- If no questions yet: empty state with `Generate Questions` button
- On click: loading state (subtle spinner + "Thinking...") → Claude streams back questions

**Claude Prompt Logic:**
```
Generate 10-12 open-ended qualitative research discussion questions for a research project.

Topic: [topic]
Research Goal: [goal]
Target Audience: [audience]

Format: Return as a numbered list. Questions should be open-ended, non-leading, and suitable for 1:1 interviews. Group them into 3 sections: Opening, Core, and Closing.
```

**Output Display:**
- Questions grouped under section headers (Opening / Core / Closing)
- Each question is a card with a number badge
- Actions per question: copy icon, delete icon
- Bottom CTA: `Regenerate Questions` | `Add Custom Question`

**Add Custom Question:**
- Inline text input that appears below the list
- Press Enter or click `Add` to save

---

### 5.5 Transcripts (`/projects/:id/transcripts`)

**Purpose:** Upload and manage interview transcripts.

**UI:**
- Heading: "Transcripts"
- Upload area: Drag & drop zone OR paste text area
  - Accepts `.txt`, `.md`, or plain text paste
  - Label field: "Participant name or label" (e.g. "User 01 — Sarah")
- Uploaded transcripts shown as a list:
  - Label, character/word count, upload date
  - Actions: View (expand), Delete
- Expanded view: full transcript text in a scrollable panel

**Storage:** Save transcript text + label to localStorage under the project

---

### 5.6 Insights (`/projects/:id/insights`)

**Purpose:** Claude analyzes all uploaded transcripts and returns structured insights.

**UI:**
- Heading: "Research Insights"
- If no transcripts: nudge message "Upload at least one transcript to generate insights."
- `Generate Insights` button → triggers Claude API call with all transcript content

**Claude Prompt Logic:**
```
You are a qualitative research analyst. Analyze the following interview transcripts and provide:

1. KEY THEMES (3-5 themes with a title and 2-3 sentence description each)
2. KEY INSIGHTS (5-8 bullet insights — specific, non-obvious findings)
3. STANDOUT VERBATIMS (5-6 direct quotes from participants that best represent the findings. Format: "Quote here" — [Participant Label])
4. RECOMMENDATIONS (3-5 actionable recommendations based on the research)

Transcripts:
[all transcript text concatenated]
```

**Output Display — 4 tabbed sections:**

**Tab 1: Themes**
- Cards with theme title (bold) + description
- Color-coded left border per theme

**Tab 2: Insights**
- Clean bulleted list, each insight on its own row
- Copy icon per insight

**Tab 3: Verbatims**
- Blockquote style cards
- Quote in italics, participant label below in secondary color
- Copy icon

**Tab 4: Recommendations**
- Numbered cards with recommendation text

**Global action:** `Regenerate Insights` button (re-runs analysis)

---

### 5.7 Ask InsightIQ (`/projects/:id/ask`)

**Purpose:** Chat interface where users can ask questions and get answers grounded in the project's transcripts and insights.

**UI:**
- Heading: "Ask InsightIQ"
- Subtext: "Ask anything about your research. Answers are based on your transcripts."
- Chat window (scrollable message history)
  - User messages: right-aligned, accent background
  - AI messages: left-aligned, white card
  - AI message includes a subtle "Based on your research" source tag
- Input bar at bottom: text input + Send button
- Suggested starter questions (shown before first message):
  - "What are the most common pain points?"
  - "What do participants think about [topic]?"
  - "What surprised you most in this research?"

**Claude Prompt Logic (system prompt):**
```
You are InsightIQ, a research assistant. You have access to the following interview transcripts and insights from a research project about [topic].

Answer the user's questions based ONLY on the provided research. If the answer isn't in the research, say so clearly. Always cite specific participant quotes or data points when relevant.

Research Context:
[transcripts + generated insights]
```

**Behavior:**
- Maintains chat history within the session
- Streaming response (character by character)
- If no transcripts uploaded: show a message "Add transcripts first to start asking questions."

---

## 6. Global UX Details

- **Loading states:** All AI calls show a pulsing skeleton loader or a minimal spinner with contextual text ("Generating questions...", "Analyzing transcripts...", "Thinking...")
- **Error states:** Friendly inline error messages. Never show raw API errors.
- **Toast notifications:** On save, copy, delete — subtle bottom-right toasts (success/error)
- **Responsive:** Works on tablet and desktop. Mobile is a bonus but not required for MVP.
- **Transitions:** Subtle fade-in on page load (150ms). No heavy animations.
- **Keyboard accessible:** All interactive elements reachable via Tab key.

---

## 7. Data Model (localStorage)

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "topic": "Research topic",
      "description": "...",
      "targetAudience": "...",
      "researchGoal": "...",
      "status": "active",
      "createdAt": "ISO date",
      "questions": [
        { "id": "uuid", "section": "Opening", "text": "..." }
      ],
      "transcripts": [
        { "id": "uuid", "label": "User 01", "text": "...", "uploadedAt": "ISO date" }
      ],
      "insights": {
        "themes": [],
        "insights": [],
        "verbatims": [],
        "recommendations": [],
        "generatedAt": "ISO date"
      },
      "chatHistory": [
        { "role": "user" | "assistant", "content": "...", "timestamp": "ISO date" }
      ]
    }
  ]
}
```

---

## 8. Claude API Integration

- Model: `claude-sonnet-4-6`
- Use streaming for all responses (feels faster and more alive)
- Pass API key via environment variable: `VITE_ANTHROPIC_API_KEY`
- All prompts should be in a single `prompts.js` config file for easy editing
- Handle rate limits gracefully with a retry message

---

## 9. MVP Scope (Build This First)

| Feature | Priority |
|---|---|
| Project creation & listing | ✅ Must have |
| AI question generation | ✅ Must have |
| Transcript upload (paste text) | ✅ Must have |
| Insights generation (themes, verbatims) | ✅ Must have |
| Ask InsightIQ chat | ✅ Must have |
| Drag & drop file upload | 🔄 Nice to have |
| Export insights as PDF | 🔄 Nice to have |
| Project sharing | ❌ Out of scope |
| User auth | ❌ Out of scope |

---

## 10. Folder Structure

```
insightiq/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/       # Sidebar, Navbar, Layout wrapper
│   │   ├── ui/           # Button, Card, Input, Toast, Badge, Tabs
│   │   ├── projects/     # ProjectCard, ProjectForm
│   │   ├── questions/    # QuestionCard, QuestionList
│   │   ├── transcripts/  # TranscriptUpload, TranscriptCard
│   │   ├── insights/     # ThemeCard, VerbatimCard, InsightList
│   │   └── chat/         # ChatWindow, ChatMessage, ChatInput
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── NewProject.jsx
│   │   ├── ProjectOverview.jsx
│   │   ├── Questions.jsx
│   │   ├── Transcripts.jsx
│   │   ├── Insights.jsx
│   │   └── Ask.jsx
│   ├── hooks/
│   │   ├── useProjects.js    # localStorage CRUD for projects
│   │   └── useClaude.js      # Claude API streaming hook
│   ├── lib/
│   │   ├── prompts.js        # All Claude prompts in one place
│   │   ├── storage.js        # localStorage helpers
│   │   └── utils.js          # UUID, date formatting, etc.
│   ├── App.jsx
│   └── main.jsx
├── .env                      # VITE_ANTHROPIC_API_KEY=...
├── package.json
└── README.md
```

---

## 11. README Instructions (include this)

```md
# InsightIQ

## Setup
1. Clone the repo
2. Run `npm install`
3. Create a `.env` file: `VITE_ANTHROPIC_API_KEY=your_key_here`
4. Run `npm run dev`

## Usage
1. Create a new research project
2. Generate AI discussion questions
3. Upload interview transcripts
4. Generate insights, themes & verbatims
5. Ask questions in the chat assistant
```

---

*Spec complete. Hand this to Claude Code and say: "Build InsightIQ exactly as described in this spec."*
