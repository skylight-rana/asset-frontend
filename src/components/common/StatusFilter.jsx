function StatusFilter({ filters, visible, onToggle, onChange }) {
  return (
    <th className="status-filter-header">
      <button
        type="button"
        className="status-filter-button"
        onClick={onToggle}
      >
        Status <i className="fas fa-filter" />
      </button>

      {visible && (
        <div className="status-filter-overlay">
          {Object.keys(filters).map((status) => (
            <label key={status} className="filter-check-row">
              <input
                type="checkbox"
                value={status}
                checked={filters[status]}
                onChange={onChange}
              />
              {status}
            </label>
          ))}
        </div>
      )}
    </th>
  );
}

export default StatusFilter;
