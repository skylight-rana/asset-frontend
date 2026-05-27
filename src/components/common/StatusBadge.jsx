function StatusBadge({ status, className }) {
  return <span className={`badge ${className}`}>{status}</span>;
}

export default StatusBadge;
