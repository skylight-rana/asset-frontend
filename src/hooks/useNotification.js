import { useCallback, useState } from "react";

function useNotification() {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((type, title, message) => {
    setNotification({ type, title, message });
  }, []);

  const showSuccess = useCallback(
    (title, message) => showNotification("success", title, message),
    [showNotification]
  );

  const showError = useCallback(
    (title, message) => showNotification("error", title, message),
    [showNotification]
  );

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    closeNotification,
  };
}

export default useNotification;
