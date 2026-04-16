const SOURCE_WEIGHT = {
  PubMed: 1,
  OpenAlex: 0.9,
  'ClinicalTrials.gov': 1,
};

export function rankPublications(items, ctx, topN = 8) {
  const now = new Date().getUTCFullYear();

  return items
    .map((item) => {
      const haystack = `${item.title} ${item.abstract}`.toLowerCase();
      const terms = [ctx.disease, ctx.intent, ctx.expandedQuery].filter(Boolean).join(' ').toLowerCase().split(/\s+/);
      const relevanceHits = terms.filter((t) => t.length > 2 && haystack.includes(t)).length;
      const recency = item.year ? Math.max(0, 1 - (now - item.year) / 15) : 0.3;
      const sourceWeight = SOURCE_WEIGHT[item.source] || 0.75;
      const score = relevanceHits * 0.55 + recency * 0.25 + sourceWeight * 0.2;
      return {...item, score};
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

export function rankTrials(items, ctx, topN = 6) {
  return items
    .map((item) => {
      const base = `${item.title} ${item.eligibility}`.toLowerCase();
      const relevance = [ctx.disease, ctx.expandedQuery]
        .filter(Boolean)
        .reduce((acc, term) => acc + (base.includes(term.toLowerCase()) ? 1 : 0), 0);
      const recruitingBoost = /recruiting|active/i.test(item.status || '') ? 0.5 : 0.2;
      return {...item, score: relevance * 0.7 + recruitingBoost * 0.3};
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
