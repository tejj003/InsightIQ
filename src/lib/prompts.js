const QUESTION_FRAMEWORKS = {
  exploration: {
    label: 'Open Exploration',
    description: 'Broad discovery questions that uncover context, habits, and lived experience — ideal for early-stage research when you don\'t yet know what you don\'t know.',
    instruction: 'Apply IDEO\'s "Immersion" and "Guided Tour" principles — ask questions that help you understand the full context of participants\' lives, habits, and environments around this topic. Use "Draw It" and "Body Language" principles: ask questions that invite storytelling and concrete examples, not abstract opinions.',
  },
  jtbd: {
    label: 'Jobs-to-be-Done',
    description: 'Uncovers what users are actually trying to accomplish and why — focuses on goals, triggers, and what "done well" means, not features or preferences.',
    instruction: 'Frame questions around the job the user is trying to accomplish. Apply IDEO\'s "Five Whys" method inline — structure questions to probe from surface behavior down to deep motivation. Ask about context, triggers, progress metrics, and what "done well" looks like for them.',
  },
  hmw: {
    label: 'How Might We',
    description: 'Generative questions that surface tensions and unmet needs — designed to feed directly into "How Might We" opportunity reframing and ideation sessions.',
    instruction: 'Apply Atomic Object\'s "How Might We" generative framing. Questions should surface tensions, unmet needs, and aspirations that could be reframed into "How Might We" opportunity statements. Include "What If" questions from the Atomic Object "I Like, I Wish, What If" method.',
  },
  painpoints: {
    label: 'Pain Point Mapping',
    description: 'Focuses on friction, failure points, and workarounds — draws out where and why things break down, for both power users and people who struggle.',
    instruction: 'Apply IDEO\'s "Extremes and Mainstreams" principle — ask questions that work for both power users and struggling users to surface the full range of friction. Use the "Five Whys" to probe beneath surface frustrations to root causes and workarounds.',
  },
  mentalmodel: {
    label: 'Mental Model',
    description: 'Reveals how users think about a domain — their vocabulary, analogies, and assumptions. Best for understanding why users behave in unexpected ways.',
    instruction: 'Apply IDEO\'s "Card Sort" and "Collage" conversational principles — ask questions that reveal vocabulary, analogies, and mental frameworks participants use. Apply the Atomic Object "Abstraction Ladder" to ask questions at multiple levels of abstraction: concrete experience, conceptual model, and aspirational ideal.',
  },
  hopesfears: {
    label: 'Hopes & Fears',
    description: 'Surfaces the emotional truth beneath rational behavior — hidden motivations, aspirations, and anxieties that participants often don\'t volunteer unprompted.',
    instruction: 'Apply the Atomic Object "Hopes & Fears" method — ask questions that reveal hidden motivations, aspirations, and anxieties participants have about this topic. Include IDEO "Conversation Starters" — present provocative ideas to spark participant reactions. This framework surfaces emotional truth beneath rational behavior.',
  },
}

export function buildQuestionsPrompt({ topic, goal, audience, framework = 'exploration' }) {
  const fw = QUESTION_FRAMEWORKS[framework] || QUESTION_FRAMEWORKS.exploration
  return `You are a senior UX researcher. Generate 10-12 open-ended qualitative research discussion questions.

Topic: ${topic}
Research Goal: ${goal || 'Understand the topic deeply'}
Target Audience: ${audience || 'General participants'}
Research Framework: ${fw.label}
Framework Guidance: ${fw.instruction}

Format: Return as a numbered list. Questions must be open-ended, non-leading, and suited for 1:1 interviews. Group into exactly 3 sections:
**Opening**
**Core**
**Closing**

Each section should have 3-4 questions. Number continuously (1, 2, 3...). Apply the framework guidance especially to the Core section.`
}

export { QUESTION_FRAMEWORKS }

const INSIGHT_FRAMEWORKS = {
  standard: {
    label: 'Standard Analysis',
    description: 'Balanced synthesis covering themes, insights, verbatims, and directions — the default IDEO "Find Themes" approach. Best all-round starting point.',
    instruction: 'Conduct a thorough qualitative analysis using IDEO\'s "Find Themes" and "Create Insight Statements" methods — surface hidden patterns, extract the most surprising non-obvious findings, and generate evidence-grounded directions.',
  },
  affinity: {
    label: 'Affinity Map',
    description: 'Groups findings by emotional and functional similarity — simulates a sticky-note clustering workshop. Great for revealing natural patterns across many participants.',
    instruction: 'Apply IDEO\'s Collaborative Synthesis approach — group raw observations by emotional resonance and functional similarity, exactly as a team would during a physical affinity mapping workshop. Themes must feel distinct, named powerfully, and grounded in participant evidence. Use the "Download Your Learnings" principle: every theme should feel like a shareable story.',
  },
  matrix: {
    label: '2×2 Priority Matrix',
    description: 'Maps recommendations by Impact vs Effort — labels each as Quick Win, Plan For, or Avoid. Forces prioritization and helps teams make hard tradeoffs.',
    instruction: 'Apply the IDEO "Top Five" prioritization method combined with an Impact vs Effort lens. In the RECOMMENDATIONS section, label each with its quadrant: [High Impact / Low Effort] — do first; [High Impact / High Effort] — plan for; [Low Impact / Low Effort] — quick wins; [Low Impact / High Effort] — avoid. Help the team make hard tradeoffs.',
  },
  hmw: {
    label: 'How Might We',
    description: 'Reframes every problem as an opportunity space — outputs "How Might We…" statements that seed ideation. Best when you\'re ready to move from research to design.',
    instruction: 'Apply the IDEO "How Might We" method rigorously — reframe every problem space as an opportunity. Use the "Abstraction Ladder" from Atomic Object to find the right level: not too narrow (tactical), not too broad (generic). HMW statements should spark brainstorming, not prescribe solutions. Make the HOW MIGHT WE section the centerpiece of this analysis.',
  },
  fivewhy: {
    label: 'Five Whys',
    description: 'Digs from surface behavior to root causes — reveals the real "why" behind what users do. Best when symptoms are visible but drivers are unclear.',
    instruction: 'Apply the IDEO "Five Whys" root-cause analysis method. For each key theme, dig beneath the surface behavior to uncover the deep motivation, assumption, or systemic cause. Themes should name the root cause, not the symptom. Insights should reveal "why this really happens" — the kind of finding that surprises even the team who ran the research.',
  },
  ilikewish: {
    label: 'I Like / I Wish / What If',
    description: 'Organizes insights into three lenses — what\'s working, what needs to change, and what\'s possible. Produces constructive synthesis that honors positives as well as problems.',
    instruction: 'Apply the Atomic Object "I Like, I Wish, What If" synthesis framework. Organize KEY INSIGHTS into three lenses: what is already working well for users (I Like), what participants wish were different or better (I Wish), and speculative opportunity spaces that emerge from the data (What If). Label each insight with its lens. This produces constructive, actionable synthesis rather than purely problem-focused analysis.',
  },
  headlines: {
    label: 'Headlines from the Future',
    description: 'Frames insights as future press headlines — "what would be written about this product in 3 years if we got it right?" Helps teams think beyond incremental fixes.',
    instruction: 'Apply the IDEO "Headlines from the Future" and Atomic Object "Cover Story" methods. After surfacing themes and insights, frame the HOW MIGHT WE section as aspirational "headlines" — what would the press say about this product/experience in 3 years if the team acted on these findings brilliantly? This future-back framing helps teams see beyond incremental improvements.',
  },
}

export function buildInsightsPrompt(transcripts, framework = 'standard') {
  const transcriptText = transcripts
    .map((t) => `--- ${t.label} ---\n${t.text}`)
    .join('\n\n')

  const fw = INSIGHT_FRAMEWORKS[framework] || INSIGHT_FRAMEWORKS.standard

  return `You are a Principal UX Research Analyst. Analyze the following interview transcripts.

Analysis Framework: ${fw.label}
Framework Guidance: ${fw.instruction}

Provide structured findings in EXACTLY this format (do not skip any section):

## KEY THEMES
List 3-5 themes. For each theme use this format:
**Theme Title**
Description of the theme in 2-3 sentences.

## KEY INSIGHTS
List 5-8 specific, non-obvious bullet point insights starting with "- ".

## STANDOUT VERBATIMS
List 5-6 direct quotes from participants. Format each as:
"Quote here" — [Participant Label]

## RECOMMENDATIONS
List 3-5 actionable recommendations as a numbered list.

## HOW MIGHT WE
Based on the themes and insights above, generate 4-6 "How Might We" opportunity statements. These reframe problems as design opportunities. Format each as:
**HMW: [Opportunity statement starting with "How might we…"]**
Theme: [Which theme this connects to]
Opportunity: [1-2 sentences on why this is a rich design space]

Transcripts:
${transcriptText}`
}

export { INSIGHT_FRAMEWORKS }

export function buildPersonasPrompt(transcripts) {
  const transcriptText = transcripts
    .map((t) => `--- ${t.label} ---\n${t.text}`)
    .join('\n\n')

  return `You are a Principal UX Researcher trained in IDEO's human-centered design methods and Nielsen Norman Group research standards. Analyze the following interview transcripts and generate 2-3 distinct, richly-evidenced user personas.

Apply these research methods in your analysis:
- IDEO "Extremes and Mainstreams": Identify both extreme users (power users, non-users, edge cases) and mainstream users — the tension between them reveals the richest design space
- IDEO "Collage" principle: Each persona should paint a vivid picture of values and thought processes, not just demographics
- IDEO "Share Inspiring Stories": Each persona should feel like a real person whose story a team would want to advocate for in a product review
- Atomic Object "Alter Egos": Personas should be clearly differentiated — if you swapped them, different design decisions would result
- Confidence levels must be honest — based strictly on how many participants and how strongly the pattern appears

For each persona return EXACTLY this format (repeat the block for each persona):

## PERSONA: [Full Name] — [Role/Archetype]
**Quote:** "[A representative quote from the research]"
**Archetype:** [Power User | Casual User | Business User | Mobile-First User]
**Confidence:** [High | Medium | Low] — [One sentence explaining the confidence level based on how many participants and how strongly the pattern appears in the data]

### Demographics
- Age Range: [e.g. 28-35]
- Occupation: [e.g. Product Manager]
- Tech Proficiency: [Beginner | Intermediate | Advanced]
- Location Type: [Urban | Suburban | Remote]

### Top 5 Unique Traits
The 5 most distinctive characteristics that differentiate this persona from the others — pulled directly from participant evidence:
- [trait 1]
- [trait 2]
- [trait 3]
- [trait 4]
- [trait 5]

### Motivations
- [motivation 1]
- [motivation 2]
- [motivation 3]

### Goals
- [goal 1]
- [goal 2]
- [goal 3]

### Frustrations
- [frustration 1]
- [frustration 2]
- [frustration 3]

### Design Implications
- [implication 1]
- [implication 2]
- [implication 3]

---

Base each persona on patterns observed across participants. Only use evidence from the transcripts.

Transcripts:
${transcriptText}`
}

export function buildReportPrompt({ topic, goal, audience, transcripts, insights, personas }) {
  const transcriptText = transcripts
    .map((t) => `--- ${t.label} ---\n${t.text}`)
    .join('\n\n')

  const insightsSummary = insights
    ? `
THEMES IDENTIFIED:
${(insights.themes || []).map((t, i) => `${i + 1}. ${t.title}: ${t.description}`).join('\n')}

KEY INSIGHTS:
${(insights.insights || []).map((ins, i) => `${i + 1}. ${ins}`).join('\n')}

STANDOUT VERBATIMS:
${(insights.verbatims || []).map((v) => `"${v.quote}" — ${v.participant}`).join('\n')}

STRATEGIC DIRECTIONS:
${(insights.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}`
    : ''

  const personasSummary = personas?.list?.length
    ? `
RESEARCH PERSONAS:
${personas.list.map((p) => `- ${p.fullName} (${p.archetype}): ${p.quote}`).join('\n')}`
    : ''

  return `You are a Principal UX Research Lead with 12+ years of experience at top-tier technology companies (Google, Meta, Apple, Amazon, Microsoft level). You have led hundreds of research programs that have directly shaped products used by billions of people. You write research reports that are referenced as gold standards internally.

You have been asked to produce a formal research report for senior leadership, product directors, and cross-functional stakeholders. This report will be distributed broadly and must reflect the highest standards of research rigor, executive communication, and strategic clarity that FAANG-level organizations demand.

METHODOLOGY FOUNDATIONS (apply these throughout):
- IDEO "Create Insight Statements": Every finding must follow the pattern — "[User] needs [need] because [insight]" — grounded in observed behavior
- IDEO "Five Whys": Recommendations must address root causes, not symptoms — ask why until you hit the real driver
- IDEO "Journey Map": Frame findings in the context of the user's end-to-end experience — emotional highs and lows matter
- IDEO "How Might We": Each recommendation section should inspire action, not prescribe solutions — open the design space
- IDEO "Top Five" prioritization: Recommendations must be rank-ordered with clear rationale for priority
- IDEO "Collaborative Synthesis": Themes must feel like they emerged from evidence clustering, not top-down categorization
- Atomic Object "Abstraction Ladder": Write at the right level — not too tactical (lists of features) nor too abstract (vague principles)
- Atomic Object "I Like, I Wish, What If": Structure the executive summary to honor what's working, what needs change, and what's possible
- Nielsen Norman Group rigor: Every usability finding must include frequency, severity, and affected user segment
- IDEO "Headlines from the Future": Close the report with a forward-looking vision — what success looks like if these findings are acted on

IMPORTANT STANDARDS YOU MUST MEET:
- Write with authority and precision — no hedging, no vague language
- Every claim must connect to evidence from the research data
- Recommendations must be specific, prioritized, and actionable — not generic
- Use a confident, professional narrative voice that earns stakeholder trust
- Structure the report so busy executives can skim AND deep readers are rewarded
- Include a clear "so what" at every level: finding, theme, and recommendation
- Treat this as a document that will influence real product and business decisions

PROJECT CONTEXT:
- Research Topic: ${topic}
- Research Goal: ${goal || 'Understand user needs, behaviors, and pain points'}
- Target Audience: ${audience || 'General users'}
- Number of Transcripts: ${transcripts.length}
${insightsSummary}${personasSummary}

FULL TRANSCRIPT DATA:
${transcriptText}

---

Generate the complete research report in EXACTLY this format. Use markdown. Be thorough, precise, and executive-ready. Do not truncate any section.

# ${topic}: Research Report

*Prepared by InsightIQ Research Platform · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}*

---

## Executive Summary

[Write 3 substantive paragraphs. Open with the single most critical finding. Second paragraph covers the landscape of findings across themes. Third paragraph previews the strategic recommendations and stakes. Write for a VP/Director who may only read this section — make every sentence earn its place.]

---

## Research Overview

### Objectives
[2-3 bullet points stating the specific research questions this study was designed to answer]

### Methodology
[Describe the research method (qualitative interviews), number of participants, approximate duration, and why this method was appropriate for the research goals]

### Participant Overview
[Describe who was interviewed — roles, contexts, diversity of perspectives. Do not use names, use descriptive labels.]

---

## Key Findings

[Write 4-6 numbered findings. Each finding must have:]
### Finding [N]: [Specific, declarative title — not vague]
**The insight:** [1-2 sentences stating the finding with precision]
**Evidence:** [2-3 specific data points or quotes from the research that support this]
**Why it matters:** [1-2 sentences on the strategic or product implication]

---

## Theme Analysis

[For each major theme identified, write a deep-dive section:]
### Theme: [Title]
[2-3 paragraphs exploring the theme — what drives it, how it manifests across participants, the nuance and tension within it, and what it signals for the product or business]

**Supporting Evidence:**
[3-4 direct quotes formatted as: "quote" — Participant Label]

---

## User Perspective Highlights

[5-7 carefully curated verbatims that best capture the human story behind the data. For each:]
> "[Quote]"
> — *[Participant Label]*
> **Context:** [One sentence explaining why this quote is significant]

---

## Strategic Recommendations

[4-6 recommendations. Each must be:]
### Recommendation [N]: [Action-oriented title starting with a verb]
**Priority:** [Critical / High / Medium]
**Rationale:** [Why this recommendation follows from the research — be specific]
**Suggested Action:** [Concrete step that a product team could act on in the next quarter]
**Success Metric:** [How you would measure whether this recommendation was acted on effectively]

---

## Research Limitations & Considerations

[Honest 1-2 paragraph assessment of scope constraints, sample size considerations, and what follow-on research would strengthen these findings. This demonstrates research rigor and intellectual honesty.]

---

## Next Steps

[A prioritized list of 4-6 action items with suggested owners (e.g., Product, Design, Engineering, Research)]

---

## Appendix: Research Guide Summary

[Brief summary of the research discussion areas covered, without listing every question verbatim]

---

*This report was generated by InsightIQ using AI-assisted qualitative analysis. All findings are grounded in the provided interview transcripts.*`
}

export function buildChatSystemPrompt({ topic, transcripts, insights }) {
  const transcriptText = transcripts
    .map((t) => `--- ${t.label} ---\n${t.text}`)
    .join('\n\n')

  const insightsText = insights
    ? `\n\nGenerated Insights Summary:\nThemes: ${(insights.themes || []).map((t) => t.title).join(', ')}\nKey Insights: ${(insights.insights || []).join(' | ')}`
    : ''

  return `You are InsightIQ, an expert research assistant. You have access to interview transcripts and insights from a research project about "${topic}".

Answer the user's questions based ONLY on the provided research. If the answer isn't in the research, say so clearly. Always cite specific participant quotes or data points when relevant. Keep answers concise and grounded in the data.

Research Context:
${transcriptText}${insightsText}`
}
