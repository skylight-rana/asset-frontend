function EmptyState({ icon, message, compact = false }) {
  return (
    <div className={`empty-state ${compact ? "compact" : ""}`}>
      <i className={icon} />
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
