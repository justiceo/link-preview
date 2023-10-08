(()=>{document.querySelector("#go-to-options").addEventListener("click",()=>{chrome.runtime.openOptionsPage?chrome.runtime.openOptionsPage():window.open(chrome.runtime.getURL("options.html"))});})();
