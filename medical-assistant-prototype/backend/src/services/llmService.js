import {env} from '../config/env.js';
import {fetchJson} from '../utils/http.js';

export async function generateStructuredAnswer({context, publications, trials, question}) {
  const prompt = buildPrompt({context, publications, trials, question});

  try {
    const response = await fetchJson(`${env.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: env.ollamaModel,
        prompt,
        stream: false,
        options: {temperature: 0.1},
      }),
    });

    return response.response || fallbackTemplate(context, publications, trials);
  } catch {
    return fallbackTemplate(context, publications, trials);
  }
}

function buildPrompt({context, publications, trials, question}) {
  return `You are an evidence-focused medical research assistant. Use only provided sources and avoid hallucinations.
User context: ${JSON.stringify(context)}
Question: ${question}
Publications: ${JSON.stringify(publications)}
Clinical trials: ${JSON.stringify(trials)}
Return markdown with sections:
1) Condition Overview
2) Research Insights
3) Clinical Trials
4) Personalized Considerations
5) Source Attribution (must map claims to studies).`;
}

function fallbackTemplate(context, publications, trials) {
  const pubLines = publications
    .slice(0, 4)
    .map((p) => `- ${p.title} (${p.year || 'n/a'}, ${p.source})`) 
    .join('\n');

  const trialLines = trials
    .slice(0, 4)
    .map((t) => `- ${t.title} (${t.status || 'Unknown'})`) 
    .join('\n');

  return `## Condition Overview\nFocus area: ${context.disease || 'General medical topic'}.\n\n## Research Insights\n${pubLines || '- No strong publication candidates found.'}\n\n## Clinical Trials\n${trialLines || '- No trial matches found.'}\n\n## Personalized Considerations\nThese findings should be reviewed by a licensed clinician before actioning treatment changes.\n\n## Source Attribution\nSee structured source cards below.`;
}
