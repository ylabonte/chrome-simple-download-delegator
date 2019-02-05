function focusOrCreateTab(url) {
  chrome.windows.getAll({"populate":true}, function(windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {"selected":true});
    } else {
      chrome.tabs.create({"url":url, "selected":true});
    }
  });
}

/**
 * Insert messages
 */
$('[data-i18n-message]').toArray().forEach(item => {
  const $item = $(item);
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
 * Initialize materialize tooltips
 */
window.Mtooltips = M.Tooltip.init($('[data-tooltip]'));

/**
 * Initialize copy from clipboard buttons
 */
$('[data-clipboard-to]').toArray().forEach(item => {
  const $item = $(item);
  const $target = $($item.data('clipboard-to'));
  $target.toArray().forEach(targetItem => {
    const $ti = $(targetItem);
    if ($ti.val().trim() == "") {
      $ti.select();
      document.execCommand('paste');
    }
  });

  $item.on('click', () => {
    $target.toArray().forEach(targetItem => {
      $(targetItem).select();
      document.execCommand('paste');
    });
  });
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

/**
 * Open Cookie Manager button functionality
 */
$('#cookieManager').on('click', (e) => {
  if (chrome.extension.getURL) {
    var manager_url = chrome.extension.getURL("cookies.html");
    focusOrCreateTab(manager_url);
  } else {
    window.open(chrome.runtime.getURL('cookies.html'));
  }
});
