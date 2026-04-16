import {buildQueryContext} from './queryExpansionService.js';
import {fetchPublicationCandidates} from './publicationService.js';
import {fetchClinicalTrialCandidates} from './clinicalTrialService.js';
import {rankPublications, rankTrials} from './rankingService.js';
import {generateStructuredAnswer} from './llmService.js';

export async function runResearchPipeline({payload, previousConversation}) {
  const context = buildQueryContext(payload, previousConversation);

  const [publicationCandidates, trialCandidates] = await Promise.all([
    fetchPublicationCandidates(context.expandedQuery, 120),
    fetchClinicalTrialCandidates(context.expandedQuery, 80),
  ]);

  const topPublications = rankPublications(publicationCandidates, context, 8);
  const topTrials = rankTrials(trialCandidates, context, 6);

  const answer = await generateStructuredAnswer({
    context,
    question: payload.query || payload.additionalQuery || '',
    publications: topPublications,
    trials: topTrials,
  });

  return {
    context,
    retrievalStats: {
      publicationCandidates: publicationCandidates.length,
      trialCandidates: trialCandidates.length,
    },
    answer,
    publications: topPublications,
    clinicalTrials: topTrials,
  };
}
