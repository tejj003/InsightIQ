# InsightIQ — Product Specification

> Living document. Last updated: March 2026.
> Source: Manager feedback review session.

---

## Vision

InsightIQ is an AI-powered qualitative research platform for product teams, UX researchers, and strategists. It transforms raw interview transcripts into structured, evidence-grounded insights using FAANG-level research rigor. The platform should feel like having a Principal UX Researcher embedded on every team.

---

## Feature Roadmap

### ✅ Implemented

- Project creation with topic, goal, and audience
- AI-generated research questions (Opening / Core / Closing)
- Transcript upload and management
- Insights generation: Themes, Key Insights, Verbatims, Recommendations
- User Personas with demographics, motivations, goals, frustrations, design implications
- Ask InsightIQ — conversational Q&A grounded in transcripts
- Executive PDF report (FAANG-standard, print-to-PDF)
- Inline persona rename + delete
- Expandable recommendations (direction-first framing)
- Verbatim cards with participant attribution

---

### 🔨 In Progress / Planned from Manager Feedback

---

#### 1. Synthesis Frameworks — Insights Page

**Problem:** Users get one fixed analysis style. Different research contexts need different synthesis lenses.

**Feature:** Framework selector on the Insights page. Before generating, user picks a lens:

| Framework | Description |
|-----------|-------------|
| Standard Analysis | Current behavior — themes, insights, verbatims, directions |
| Affinity Map | Clusters findings into emotional and functional affinity groups |
| 2×2 Priority Matrix | Maps recommendations by Impact (High/Low) vs Effort (High/Low) |
| How Might We | Converts themes into HMW opportunity statements for ideation |

**Implementation:** Framework selector UI (pill buttons) in Insights header. Selected framework modifies the Claude prompt framing. Output sections remain consistent for reliable parsing.

**Status:** ✅ Implemented (v2)

---

#### 2. How Might We (HMW) Tab — Insights Page

**Problem:** No bridge between theme synthesis and ideation/solution generation.

**Feature:** A dedicated "How Might We" tab in Insights. After insights are generated, HMW statements are automatically produced from the identified themes — reframing problems as opportunity spaces.

Format per HMW:
- The HMW statement (opportunity framing)
- Linked theme
- Why this matters for product/design

**Status:** ✅ Implemented (v2)

---

#### 3. Persona Confidence Levels

**Problem:** All personas appear equally evidenced, but some are strongly data-backed while others are inferred from limited signals.

**Feature:** Each persona now includes a **Confidence Level** — `High`, `Medium`, or `Low` — based on how strongly the persona pattern appears across participant data. Displayed as a colored badge on the persona card.

- High → green badge (3+ participants clearly match)
- Medium → yellow badge (2 participants, partial match)
- Low → red/muted badge (1 participant or inferred)

**Status:** ✅ Implemented (v2)

---

#### 4. Top 5 Unique Traits per Persona

**Problem:** Persona cards blend shared traits with individual differentiators, making it hard to distinguish personas quickly.

**Feature:** Each persona now includes a **Top 5 Unique Traits** section — the most distinctive characteristics that differentiate this persona from others. Sourced directly from participant data.

**Status:** ✅ Implemented (v2)

---

#### 5. Framework-Based Question Suggestions — Questions Page

**Problem:** Users generating research questions don't always know which research framework fits their goal.

**Feature:** When generating questions, show a **Research Framework** selector:

| Framework | Best For |
|-----------|----------|
| Open Exploration | General discovery research |
| Jobs-to-be-Done | Understanding user motivations and task goals |
| How Might We | Generative, solution-oriented research |
| Pain Point Mapping | Identifying friction and failure points |
| Mental Model | Understanding how users think about a domain |

Selected framework adds context to the question generation prompt, producing sharper, more framework-aligned questions.

**Status:** ✅ Implemented (v2)

---

### 📋 Backlog (Future Sprints)

#### 6. Word Cloud — Metaphors & Analogies

**Problem:** No visual discovery mechanism for language patterns.

**Feature:** After insights are generated, surface a visual Word Cloud of the most frequent metaphors, analogies, and emotional words used by participants. Helps researchers spot linguistic patterns invisible in linear text.

**Tech:** Requires a canvas-based word cloud renderer (e.g., d3-cloud or custom canvas). Frequency data extracted from transcript text by Claude.

**Priority:** Medium

---

#### 7. Experience / Journey Map

**Problem:** No emotional arc visualization across the user journey.

**Feature:** Generate a simplified Journey Map from transcripts — stages of the user's experience mapped against emotional sentiment (positive / neutral / negative) and functional needs.

Output:
- Journey stages (auto-detected or user-defined)
- Emotional tone per stage (sentiment analysis)
- Key moments of delight and frustration
- Opportunity zones

**Tech:** Custom SVG/canvas chart or a table-based fallback.

**Priority:** High (next sprint)

---

#### 8. Industry Benchmarking

**Problem:** Findings exist in isolation — no external anchor to known UX research standards.

**Feature:** When generating insights, optionally include a reference layer from established frameworks (IDEO, Nielsen Norman Group). Claude uses these as interpretive anchors when scoring severity of findings and framing recommendations.

**Implementation:** System prompt additions referencing these methodologies. No external API required — knowledge is embedded in the model.

**Priority:** Medium

---

#### 9. Synthesis Templates — "How Might We" Output

**Problem:** No structured path from themes to ideation artifacts.

**Feature:** A "Templates" section that lets users export insights in structured formats:
- HMW Statement Cards (one per theme)
- Opportunity Brief (1-pager per major finding)
- Affinity Map Export (grouped clusters as text/PDF)

**Priority:** Low

---

---

## Methodology Library — Embedded Knowledge Base

InsightIQ's AI prompts are grounded in the following validated UX research frameworks. These are not just references — they are actively baked into every generation.

### Source: IDEO Design Kit (designkit.org)

#### Inspiration Phase Methods (embedded in transcript analysis)
| Method | How InsightIQ Uses It |
|--------|----------------------|
| **Five Whys** | "Five Whys" framework mode digs from surface behavior to root causes |
| **Extremes and Mainstreams** | Persona generation explicitly identifies edge-case and mainstream users |
| **Immersion** | Question generation encourages lived-experience probing |
| **Collage (values mapping)** | Personas paint vivid value portraits, not just demographics |
| **Card Sort** | Mental Model question framework surfaces vocabulary and priorities |
| **Expert Interview principles** | Report generation adopts expert researcher voice and standards |
| **Body Language / Draw It** | Question generation prompts for concrete storytelling, not abstract opinions |

#### Ideation Phase Methods (embedded in synthesis)
| Method | How InsightIQ Uses It |
|--------|----------------------|
| **Create Insight Statements** | Report prompt enforces "[User] needs [X] because [insight]" pattern |
| **Find Themes** | Affinity Map framework mode clusters by emotional + functional resonance |
| **How Might We** | Dedicated HMW tab in Insights + HMW framework mode |
| **Download Your Learnings** | Insights structured for team shareability |
| **Share Inspiring Stories** | Personas and verbatims framed as narratives, not data points |
| **Collaborative Synthesis** | Affinity Map mode simulates team synthesis workshop output |
| **Top Five prioritization** | 2×2 Priority Matrix mode rank-orders recommendations with rationale |
| **Headlines from the Future** | "Headlines" framework mode + Report closing vision section |
| **Brainstorm / Bundle Ideas** | HMW statements designed to open, not prescribe, the solution space |
| **Design Principles** | *(Backlog)* Auto-generate design principles from synthesized themes |

#### Implementation Phase Methods (embedded in report)
| Method | How InsightIQ Uses It |
|--------|----------------------|
| **Journey Map** | Report includes emotional arc framing; Journey Map page planned |
| **Get Feedback / Integrate and Iterate** | Research Limitations section in reports models iteration thinking |
| **Monitor and Evaluate** | Recommendations include Success Metrics |
| **Explore Theory of Change** | Report Next Steps section ties actions to impact |
| **Create a Pitch** | Report structured for stakeholder presentation |

---

### Source: Atomic Object UX Techniques (spin.atomicobject.com)

| Method | How InsightIQ Uses It |
|--------|----------------------|
| **How Might We** | Core synthesis framework — HMW tab, HMW framework mode, question generation |
| **Abstraction Ladder** | Prompts calibrated to mid-level abstraction — not too tactical, not too generic |
| **I Like, I Wish, What If** | Dedicated synthesis framework mode in Insights; Report Executive Summary structure |
| **Hopes & Fears** | Dedicated question framework mode — surfaces hidden motivations and anxieties |
| **Alter Egos** | Personas differentiated so swapping them changes design decisions |
| **Crazy 8s** | *(Backlog)* Rapid ideation mode: generate 8 product directions from insights |
| **Cover Story / Headlines from Future** | "Headlines" framework mode in Insights |
| **Dot Voting (Visualize the Vote)** | *(Backlog)* Let users vote/prioritize recommendations |
| **Hopes & Fears** | Question framework mode for emotional-truth research |

---

## Design Principles

1. **Evidence first** — every AI output must be traceable to source data
2. **Framework flexibility** — support multiple synthesis methodologies, not just one
3. **Executive-ready** — outputs should be shareable with leadership without editing
4. **Researcher respect** — the platform assists, never replaces, the researcher's judgment
5. **Progressive disclosure** — simple by default, powerful on demand

---

## Technical Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Claude (claude-sonnet-4-6) or GPT-4o via direct browser API calls
- localStorage for all project data (no backend)
- Browser print API for PDF export

---

*This spec is maintained in the InsightIQ repository. Update after each sprint.*
