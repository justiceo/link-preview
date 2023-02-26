(async () => {
  const src = chrome.runtime.getURL("welcome/my-element.js");
  const contentMain = await import(src);
  contentMain.main();
})();

document.getElementById("demo-button").onclick = function (e) {
  window.postMessage(
    { application: "better-previews", action: "search", data: "hello world" },
    window.location.origin
  );
};
