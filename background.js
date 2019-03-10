chrome.runtime.onInstalled.addListener(() => {
  chrome.browserAction.setBadgeText({text: '0'});
  chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
});

async function getClipboardText() {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
    return "";
  }
}
