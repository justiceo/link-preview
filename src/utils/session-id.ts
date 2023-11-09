// chrome.storage.session can only be accessed reliably from a trusted context (e.g. service-worker).
// Using `chrome.storage.session.setAccessLevel -> 'TRUSTED_AND_UNTRUSTED_CONTEXTS'` doesn't cut it in some contexts.
// This script makes it easy to ping the service-worker for session data from any context in the extension.

// Duration of inactivity after which a new session is created (for analytics purposes).
const SESSION_EXPIRATION_IN_MIN = 30;

export async function getOrCreateSessionId() {
  // Use storage.session because it is only in memory (recreated per browser session)
  let { sessionData } = await chrome.storage.session.get("sessionData");
  const currentTimeInMs = Date.now();
  // Check if session exists and is still valid
  if (sessionData && sessionData.timestamp) {
    // Calculate how long ago the session was last updated
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
    // Check if last update lays past the session expiration threshold
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      // Clear old session id to start a new session
      sessionData = null;
    } else {
      // Update timestamp to keep session alive
      sessionData.timestamp = currentTimeInMs;
      await chrome.storage.session.set({ sessionData });
    }
  }
  if (!sessionData) {
    // Create and store a new session
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs.toString(),
    };
    await chrome.storage.session.set({ sessionData });
  }
  return sessionData.session_id;
}