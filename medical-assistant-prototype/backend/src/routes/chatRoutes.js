import {Router} from 'express';
import {Conversation} from '../models/Conversation.js';
import {runResearchPipeline} from '../services/researchOrchestrator.js';

export const chatRouter = Router();

chatRouter.post('/message', async (req, res, next) => {
  try {
    const {conversationId, patientName, disease, intent, query, additionalQuery, location} = req.body;

    const conversation = conversationId
      ? await Conversation.findById(conversationId)
      : new Conversation({patientName, location, currentCondition: disease});

    if (!conversation) {
      return res.status(404).json({error: 'Conversation not found'});
    }

    const payload = {patientName, disease, intent, query, additionalQuery, location};
    const result = await runResearchPipeline({payload, previousConversation: conversation});

    conversation.patientName = patientName || conversation.patientName;
    conversation.location = location || conversation.location;
    conversation.currentCondition = result.context.disease || conversation.currentCondition;

    conversation.messages.push({
      role: 'user',
      content: query || additionalQuery,
      disease: result.context.disease,
      intent: result.context.intent,
      queryExpansion: result.context.expandedQuery,
    });

    conversation.messages.push({
      role: 'assistant',
      content: result.answer,
      disease: result.context.disease,
      intent: result.context.intent,
      queryExpansion: result.context.expandedQuery,
      sources: [
        ...result.publications.map((p) => ({
          sourceType: p.sourceType,
          title: p.title,
          authors: p.authors,
          year: p.year,
          url: p.url,
          snippet: p.abstract?.slice(0, 240),
        })),
        ...result.clinicalTrials.map((t) => ({
          sourceType: t.sourceType,
          title: t.title,
          authors: [],
          year: undefined,
          url: t.url,
          snippet: t.eligibility?.slice(0, 240),
        })),
      ],
    });

    await conversation.save();

    return res.json({conversationId: conversation.id, ...result});
  } catch (error) {
    return next(error);
  }
});

chatRouter.get('/conversation/:id', async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id).lean();
    if (!conversation) return res.status(404).json({error: 'Conversation not found'});
    return res.json(conversation);
  } catch (error) {
    return next(error);
  }
});
