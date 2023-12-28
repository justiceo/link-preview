document.getElementById("demo-button").onclick = function (e) {
  window.postMessage(
    { application: "search-preview", action: "search", data: "hello world" },
    window.location.origin,
  );
};
