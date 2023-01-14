/** Saves options to chrome.storage */
function saveOptions() {
  const color = document.getElementById("color").value;
  const likesColor = document.getElementById("like").checked;
  chrome.storage.sync.set({
    favoriteColor: color,
    likesColor: likesColor,
  }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
}

/**
 * Restores select box and checkbox state using the preferences
 * stored in chrome.storage.
 */
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: "red",
    likesColor: true,
  }, (items) => {
    document.getElementById("color").value = items.favoriteColor;
    document.getElementById("like").checked = items.likesColor;
  });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener(
    "click",
    saveOptions,
);
