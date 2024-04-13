import analytics from "../utils/analytics";

document.getElementById("demo-button").onclick = function (e) {
  window.postMessage(
    { application: "search-preview", action: "search", data: "hello world" },
    window.location.origin,
  );
};

document.addEventListener("DOMContentLoaded", async () => {
  await analytics.firePageViewEvent("Welcome Page", "/welcome.html");
  window.onerror = (event, source, lineno, colno, error) => {
    analytics.fireErrorEvent(error, {
      event: event,
      source: source,
      lineno: lineno,
    });
  };
});
