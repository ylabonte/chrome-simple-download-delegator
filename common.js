/**
 * Focus or create tab with given URL.
 *
 * This function is used to avoid multiple open settings tabs.
 *
 * @param url URL to open or focus tab for.
 */
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
 * Insert messages (i18n/translation)
 */
const _ = chrome.i18n.getMessage;
function translateDom() {
  $('[data-i18n-message]').each((idx, item) => {
    let $item = $(item);
    if ($item.is('[data-i18n-attribute]')) {
      $item.attr($item.data('i18n-attribute'), _($item.data('i18n-message')));
    }
    else {
      if ($item.is('[data-i18n-replace]')) {
        $item.html(_($item.data('i18n-message')));
      } else {
        $item.append(_($item.data('i18n-message')));
      }
    }
  });
  $('[data-i18n-attributes]').each((idx, item) => {
    $.each(item.attributes, (idx, attr) => {
      const attrParts = attr.name.match(/^data-i18n-attribute-(.*)$/i);
      if (attrParts) {
        $(item).attr(attrParts[1], _(attr.value));
      }
    });
  });
}
translateDom();

/**
 * Initialize materialize tooltips
 */
window.Mtooltips = M.Tooltip.init($('[data-tooltip]'));

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

/**
 * Check whether the given string is a valid URL.
 * @param url
 * @returns {boolean}
 */
function isUrl(url) {
  if (!String(url).trim().length) return;
  else return $('<input type="url">').val(url).get(0).validity.valid;
}

/**
 * Initialize copy from clipboard buttons
 */
function getClipboardText() {
  $('body').append($('<textarea id="pasteArea"></textarea>'));
  $('#pasteArea').focus();
  document.execCommand('paste');
  let text = $('#pasteArea').val();
  $('#pasteArea').remove();
  return text;
}
$('[data-clipboard-to]').toArray().forEach(item => {
  const $item = $(item);
  const $target = $($item.data('clipboard-to'));
  const clipboardText = getClipboardText();
  const autoPaste = $item.data('auto-paste') && isUrl(clipboardText);

  if (autoPaste) {
    $target.toArray().forEach(targetItem => {
      const $ti = $(targetItem);
      if ($ti.val().trim() == "") {
        $ti.val(clipboardText);
        setTimeout(updateCookiesList(), 500);
      }
    });
  }

  $item.on('click', () => {
    $target.toArray().forEach(targetItem => {
      $(targetItem).val(getClipboardText());
    });
  });
});
