chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'toast':
      M.toast(msg.toast);
      break;
    case 'getLocation':
      sendResponse(document.location);
      break;
    case 'getDOM':
      sendResponse(document);
      break;
  }
});
