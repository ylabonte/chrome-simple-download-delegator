chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  switch (msg.text) {
    case 'getLocation':
      sendResponse(document.location);
      break;
    case 'getDOM':
      sendResponse(document);
      break;
  }
});
