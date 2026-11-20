export default function ErrorMessage({ title, message, onRetry }) {
  return (
    <div className="error" role="alert">
      <span className="error-icon" aria-hidden="true">⚠️</span>
      <div className="error-body">
        <strong>{title}</strong>
        <span>{message}</span>
        {onRetry && (
          <button type="button" className="retry" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
