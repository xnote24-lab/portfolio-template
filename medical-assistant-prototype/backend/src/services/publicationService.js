import {fetchJson} from '../utils/http.js';

export async function fetchPublicationCandidates(query, candidateLimit = 120) {
  const [openAlex, pubMed] = await Promise.all([
    fetchOpenAlex(query, candidateLimit / 2),
    fetchPubMed(query, candidateLimit / 2),
  ]);

  return [...openAlex, ...pubMed];
}

async function fetchOpenAlex(query, limit = 60) {
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('search', query);
  url.searchParams.set('per-page', String(Math.min(100, limit)));
  url.searchParams.set('sort', 'relevance_score:desc');

  const data = await fetchJson(url.toString());
  return (data.results || []).map((item) => ({
    source: 'OpenAlex',
    sourceType: 'openalex',
    id: item.id,
    title: item.display_name,
    abstract: item.abstract_inverted_index ? unpackAbstract(item.abstract_inverted_index) : '',
    authors: (item.authorships || []).map((a) => a.author?.display_name).filter(Boolean),
    year: item.publication_year,
    url: item.primary_location?.landing_page_url || item.id,
  }));
}

async function fetchPubMed(query, limit = 60) {
  const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  searchUrl.searchParams.set('db', 'pubmed');
  searchUrl.searchParams.set('retmode', 'json');
  searchUrl.searchParams.set('retmax', String(Math.min(200, limit)));
  searchUrl.searchParams.set('term', query);

  const search = await fetchJson(searchUrl.toString());
  const ids = search.esearchresult?.idlist || [];
  if (!ids.length) return [];

  const summaryUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
  summaryUrl.searchParams.set('db', 'pubmed');
  summaryUrl.searchParams.set('retmode', 'json');
  summaryUrl.searchParams.set('id', ids.join(','));

  const summary = await fetchJson(summaryUrl.toString());
  return ids
    .map((id) => summary.result?.[id])
    .filter(Boolean)
    .map((item) => ({
      source: 'PubMed',
      sourceType: 'pubmed',
      id: item.uid,
      title: item.title,
      abstract: '',
      authors: (item.authors || []).map((a) => a.name),
      year: Number((item.pubdate || '').slice(0, 4)) || undefined,
      url: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`,
    }));
}

function unpackAbstract(invertedIndex) {
  const ordered = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) ordered[pos] = word;
  }
  return ordered.join(' ');
}
