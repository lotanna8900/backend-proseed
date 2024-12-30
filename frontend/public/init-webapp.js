const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Make WebApp instance globally accessible
    window.tgWebApp = tg;

    // Expand to full height
    tg.expand();

    // Enable closing confirmation
    tg.enableClosingConfirmation();

    // Mark WebApp as ready
    tg.ready();

    // Send authentication data to backend
    if (tg.initData) {
      fetch("/api/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ initData: tg.initData }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Authentication successful:", data);
          // Dispatch event for successful auth
          window.dispatchEvent(new CustomEvent('tg-auth-success', { detail: data }));
        })
        .catch((error) => {
          console.error("Authentication failed:", error);
          // Dispatch event for auth failure
          window.dispatchEvent(new CustomEvent('tg-auth-failed', { detail: error }));
        });
    }

    // Return WebApp instance
    return tg;
  } else {
    console.error("Telegram WebApp is not available");
    return null;
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initTelegramWebApp);