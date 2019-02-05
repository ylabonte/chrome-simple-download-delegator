/**
 * Insert messages
 */
$('[data-i18n-message]').each((idx, item) => {
  let $item = $(item);
  if ($item.is('[data-i18n-attribute]')) {
    $item.attr($item.data('i18n-attribute'), chrome.i18n.getMessage($item.data('i18n-message')));
  }
  else {
    if ($item.is('[data-i18n-replace]')) {
      $item.html(chrome.i18n.getMessage($item.data('i18n-message')));
    } else {
      $item.append(chrome.i18n.getMessage($item.data('i18n-message')));
    }
  }
});

/**
 * GoToOptions button functionality
 */
$('#goToOptions').on('click', (e) => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

chrome.browserAction.setBadgeText({text: '0'});
chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
