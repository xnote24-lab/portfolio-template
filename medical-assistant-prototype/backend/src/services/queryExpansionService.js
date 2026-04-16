const INTENT_TERMS = {
  treatment: ['therapy', 'intervention', 'management'],
  prevention: ['risk reduction', 'screening', 'prophylaxis'],
  nutrition: ['diet', 'supplement', 'lifestyle'],
  diagnostics: ['biomarker', 'detection', 'diagnosis'],
};

export function buildQueryContext(payload, previousConversation) {
  const disease = payload.disease || previousConversation?.currentCondition || '';
  const intent = payload.intent || inferIntent(payload.additionalQuery || payload.query || '');
  const location = payload.location || previousConversation?.location || '';

  const terms = [
    payload.query,
    payload.additionalQuery,
    disease,
    ...(INTENT_TERMS[intent] || []),
  ].filter(Boolean);

  return {
    disease,
    intent,
    location,
    expandedQuery: terms.join(' ').trim(),
  };
}

function inferIntent(text) {
  const content = text.toLowerCase();
  if (/(treat|therapy|drug|surgery|stimulation)/.test(content)) return 'treatment';
  if (/(prevent|risk|avoid)/.test(content)) return 'prevention';
  if (/(vitamin|diet|nutrition|food|supplement)/.test(content)) return 'nutrition';
  if (/(diagnos|test|screen|marker)/.test(content)) return 'diagnostics';
  return 'treatment';
}
