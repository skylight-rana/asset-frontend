function DetailsModal({ title, icon = "fas fa-circle-info", open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="section-title no-margin">
            <i className={`${icon} text-muted`} />
            <span>{title}</span>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default DetailsModal;
