export default function Loading({ label }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
