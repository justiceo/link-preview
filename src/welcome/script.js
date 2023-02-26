
document.getElementById("demo-button").onclick = function (e) {
  window.postMessage(
    { application: "better-previews", action: "search", data: "hello world" },
    window.location.origin
  );
};
