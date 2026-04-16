export function SourceTable({publications = [], clinicalTrials = []}) {
  return (
    <div className="source-grid">
      <section>
        <h3>Top Publications</h3>
        {publications.map((item) => (
          <article key={`${item.source}-${item.id}`} className="card">
            <a href={item.url} target="_blank" rel="noreferrer">
              <strong>{item.title}</strong>
            </a>
            <p>{item.authors?.slice(0, 5).join(', ') || 'Authors unavailable'}</p>
            <small>
              {item.year || 'n/a'} • {item.source}
            </small>
          </article>
        ))}
      </section>

      <section>
        <h3>Top Clinical Trials</h3>
        {clinicalTrials.map((trial) => (
          <article key={trial.id} className="card">
            <a href={trial.url} target="_blank" rel="noreferrer">
              <strong>{trial.title}</strong>
            </a>
            <p>Status: {trial.status || 'Unknown'}</p>
            <p>Eligibility: {trial.eligibility?.slice(0, 160)}...</p>
            <small>{trial.location}</small>
          </article>
        ))}
      </section>
    </div>
  );
}
