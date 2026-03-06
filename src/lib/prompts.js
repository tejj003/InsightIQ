export function buildQuestionsPrompt({ topic, goal, audience }) {
  return `Generate 10-12 open-ended qualitative research discussion questions for a research project.

Topic: ${topic}
Research Goal: ${goal || 'Understand the topic deeply'}
Target Audience: ${audience || 'General participants'}

Format: Return as a numbered list. Questions should be open-ended, non-leading, and suitable for 1:1 interviews. Group them into exactly 3 sections with these exact headers:
**Opening**
**Core**
**Closing**

Each section should have 3-4 questions. Number them continuously (1, 2, 3...).`
}

export function buildInsightsPrompt(transcripts) {
  const transcriptText = transcripts
    .map((t) => `--- ${t.label} ---\n${t.text}`)
    .join('\n\n')

  return `You are a qualitative research analyst. Analyze the following interview transcripts and provide structured findings in exactly this format:

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

Transcripts:
${transcriptText}`
}

export function buildPersonasPrompt(transcripts) {
  const transcriptText = transcripts
    .map((t) => `--- ${t.label} ---\n${t.text}`)
    .join('\n\n')

  return `You are a UX researcher. Analyze the following interview transcripts and generate 2-3 distinct user personas.

For each persona return EXACTLY this format (repeat the block for each persona):

## PERSONA: [Full Name] — [Role/Archetype]
**Quote:** "[A representative quote from the research]"
**Archetype:** [Power User | Casual User | Business User | Mobile-First User]

### Demographics
- Age Range: [e.g. 28-35]
- Occupation: [e.g. Product Manager]
- Tech Proficiency: [Beginner | Intermediate | Advanced]
- Location Type: [Urban | Suburban | Remote]

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
