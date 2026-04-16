import {useState} from 'react';
import {useMedicalAssistant} from './hooks/useMedicalAssistant';
import {SourceTable} from './components/SourceTable';
import './styles.css';

const initial = {
  patientName: '',
  disease: '',
  intent: 'treatment',
  query: '',
  additionalQuery: '',
  location: '',
};

export default function App() {
  const [form, setForm] = useState(initial);
  const {conversationId, loading, result, error, ask} = useMedicalAssistant();

  const update = (key, value) => setForm((prev) => ({...prev, [key]: value}));

  const onSubmit = async (e) => {
    e.preventDefault();
    await ask(form);
  };

  return (
    <main className="container">
      <h1>AI-powered Medical Research Assistant</h1>
      <p className="sub">Structured intake → deep retrieval (OpenAlex, PubMed, ClinicalTrials) → LLM reasoning</p>

      <form className="panel" onSubmit={onSubmit}>
        <input placeholder="Patient Name" value={form.patientName} onChange={(e) => update('patientName', e.target.value)} />
        <input placeholder="Disease of Interest" value={form.disease} onChange={(e) => update('disease', e.target.value)} required />
        <select value={form.intent} onChange={(e) => update('intent', e.target.value)}>
          <option value="treatment">Treatment</option>
          <option value="prevention">Prevention</option>
          <option value="nutrition">Nutrition</option>
          <option value="diagnostics">Diagnostics</option>
        </select>
        <input placeholder="Primary Question" value={form.query} onChange={(e) => update('query', e.target.value)} required />
        <input placeholder="Additional Query (optional)" value={form.additionalQuery} onChange={(e) => update('additionalQuery', e.target.value)} />
        <input placeholder="Location (optional)" value={form.location} onChange={(e) => update('location', e.target.value)} />
        <button disabled={loading}>{loading ? 'Thinking...' : 'Run Research Pipeline'}</button>
      </form>

      {conversationId && <p className="meta">Conversation ID: {conversationId}</p>}
      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <section className="panel">
            <h2>Assistant Response</h2>
            <p className="meta">
              Query expansion: <code>{result.context.expandedQuery}</code>
            </p>
            <p className="meta">
              Retrieved {result.retrievalStats.publicationCandidates} publication candidates and {result.retrievalStats.trialCandidates} trial candidates.
            </p>
            <article className="markdown">{result.answer}</article>
          </section>
          <SourceTable publications={result.publications} clinicalTrials={result.clinicalTrials} />
        </>
      )}
    </main>
  );
}
