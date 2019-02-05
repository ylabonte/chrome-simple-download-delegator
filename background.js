chrome.runtime.onInstalled.addListener(() => {
  chrome.browserAction.setBadgeText({text: '0'});
  chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
});
