import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    sourceType: {type: String, enum: ['openalex', 'pubmed', 'clinicaltrials'], required: true},
    title: {type: String, required: true},
    authors: {type: [String], default: []},
    year: Number,
    url: String,
    snippet: String,
  },
  {_id: false},
);

const messageSchema = new mongoose.Schema(
  {
    role: {type: String, enum: ['user', 'assistant'], required: true},
    content: {type: String, required: true},
    disease: String,
    intent: String,
    queryExpansion: String,
    sources: {type: [sourceSchema], default: []},
    createdAt: {type: Date, default: Date.now},
  },
  {_id: false},
);

const conversationSchema = new mongoose.Schema(
  {
    patientName: String,
    location: String,
    currentCondition: String,
    messages: {type: [messageSchema], default: []},
  },
  {timestamps: true},
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
