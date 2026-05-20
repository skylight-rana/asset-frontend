export function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "—";
}

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const message = error?.response?.data || error?.message || fallback;

  if (typeof message === "string") return message;

  return fallback;
}
