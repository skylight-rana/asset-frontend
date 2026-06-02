function NotificationDialog({ open, type = "success", title, message, onClose }) {
  if (!open) return null;

  const config = {
    success: { icon: "fa-circle-check", title: title || "Success" },
    error: { icon: "fa-circle-xmark", title: title || "Error" },
    warning: { icon: "fa-triangle-exclamation", title: title || "Warning" },
    info: { icon: "fa-circle-info", title: title || "Information" },
  }[type] || { icon: "fa-circle-info", title: title || "Message" };

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div className={`notification-dialog notification-${type}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="notification-icon"><i className={`fas ${config.icon}`} /></div>
        <div className="notification-content">
          <h3>{config.title}</h3>
          {message && <p>{message}</p>}
        </div>
        <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close message">
          <i className="fas fa-xmark" />
        </button>
      </div>
    </div>
  );
}

export default NotificationDialog;
