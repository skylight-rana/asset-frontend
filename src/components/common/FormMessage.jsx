function FormMessage({ message, type = "error", banner = false }) {
  if (!message) return null;

  const className = type === "success"
    ? "form-success"
    : banner
      ? "form-error-banner"
      : "form-error";

  return <div className={className}>{message}</div>;
}

export default FormMessage;
