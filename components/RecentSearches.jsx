export default function RecentSearches({ places, onPick, onRemove }) {
  if (!places.length) return null;

  // When two saved places share a name (Paris, France / Paris, Texas), add the region to tell them apart
  const counts = {};
  for (const p of places) counts[p.name] = (counts[p.name] ?? 0) + 1;
  const label = (p) => (counts[p.name] > 1 && p.region ? `${p.name}, ${p.region.split(",")[0]}` : p.name);

  return (
    <div className="recent" aria-label="Recent searches">
      {places.map((p) => (
        <span className="chip" key={p.id}>
          <button type="button" onClick={() => onPick(p)} title={p.region}>
            {label(p)}
          </button>
          <button type="button" className="chip-x" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.name}`}>
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
