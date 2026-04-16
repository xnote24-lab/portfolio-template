# AI-powered Medical Research Assistant (MERN Prototype)

This prototype is a full-stack MERN-style application that behaves like a health research companion:

1. Accepts structured + natural medical queries.
2. Expands queries with disease + intent context.
3. Retrieves deep candidate pools from OpenAlex, PubMed, and ClinicalTrials.gov.
4. Re-ranks for relevance, recency, and source credibility.
5. Uses a custom open-source LLM runtime (Ollama) for final structured reasoning.
6. Maintains conversation context in MongoDB for follow-ups.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **LLM:** Open-source model served via Ollama (default: `llama3.1:8b`)

## Folder Structure

- `backend/` – API, retrieval pipeline, ranking, context memory
- `frontend/` – chatbot UX + source cards

## Backend Pipeline

`POST /api/chat/message` workflow:

- Build context from user input + conversation memory
- Expand query (`query + disease + intent terms`)
- Retrieve broad candidates:
  - OpenAlex: up to 100
  - PubMed: up to 200 (configured 60)
  - ClinicalTrials.gov: up to 100 (configured 80)
- Re-rank and trim to response set:
  - Top 8 publications
  - Top 6 clinical trials
- Prompt Ollama with grounded evidence
- Store turn in MongoDB with source attribution

## Quick Start

### 1) Backend

```bash
cd medical-assistant-prototype/backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd medical-assistant-prototype/frontend
npm install
npm run dev
```

### 3) Required services

- MongoDB running locally (or set remote URI in `.env`)
- Ollama running with an installed model:

```bash
ollama pull llama3.1:8b
ollama serve
```

## Example Request

```json
{
  "patientName": "John Smith",
  "disease": "Parkinson's disease",
  "query": "Deep Brain Stimulation",
  "location": "Toronto, Canada"
}
```

The backend will automatically expand this into a richer search query and return structured output with sources and snippets.

## Notes for Hackathon Submission

- Deployment suggestion: Render (backend) + Vercel/Netlify (frontend) + MongoDB Atlas.
- Demo video should show:
  - initial query
  - follow-up question using previous context
  - source-backed output sections
