import { Floatie } from "./floatie";

document.querySelector("body").innerHTML = `
<h1>Floatie demo</h1>
<p>Select example.com or http://example.com or hover over <a href="http://example.org">this link</a> for URL example</p>
<p>Some phone number 800-123-4567</p>
<p>And email address johndoe@example.org</p>
<p>Dates like January 2, 2022 are also data</p>
<p>Lorem Ipsum is simply dummy text of the printing and 
typesetting industry. Lorem Ipsum has been the industry's 
standard dummy text ever since the 1500s, when an unknown 
printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>

<p>(2) Lorem Ipsum is simply dummy text of the printing and 
typesetting industry. Lorem Ipsum has been the industry's
standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>

<p id="notice" style="background-color: lightyellow">Action Result: </p>
  `

const f = new Floatie();
f.startListening();
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) {
    console.warn("Ignoring message from different origin", event.origin, event.data);
    return;
  }

  console.log("#WindowMessage: ", event);
  const notice = document.getElementById("notice");
  if (notice) {
    notice.innerHTML = `Action result: ${event.data.action} "${event.data.data}"`;
  }
}, false);