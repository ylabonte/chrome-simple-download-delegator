loadSettings();

chrome.runtime.onInstalled.addListener(() => {
  chrome.browserAction.setBadgeText({
    text: '0'
  });
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#4688F1'
  });

  chrome.contextMenus.create({
    id: 'download',
    title: _('context_menu_download'),
    type: 'normal',
    contexts: ['link'],
    onclick: (info, tab) => {
      if (!isUrl(info.linkUrl)) {
        console.warn('Not a valid URL', url);
        return;
      }

      chrome.storage.sync.get(['remote_target', 'username', 'password'], (settings) => {
        if ('remote_target' in settings) {
          chrome.cookies.getAllCookieStores(cookieStores => {
            cookieStores.forEach(cookieStore => {
              if (cookieStore.tabIds.indexOf(tab.id) >= 0) {
                chrome.cookies.getAll({
                  storeId: cookieStore.id,
                  url: info.linkUrl
                }, (cookies) => {
                  let ddcUrl = settings.remote_target;
                  let requestPayload = [{
                    url: info.linkUrl,
                    header: [
                      `User-Agent: ${navigator.userAgent}`,
                      `Cookie: ${cookies.map(cookie => `${cookie.name}=${cookie.value};`).join('')}`
                    ]
                  }];

                  $.ajax(ddcUrl, {
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: 'json',
                    data: JSON.stringify(requestPayload),
                    beforeSend: xhr => {
                      if ('username' in settings && 'password' in settings && settings.username.length > 0 && settings.password.length > 0) {
                        console.info('Adding authorization header');
                        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(settings.username + ':' + settings.password));
                      }
                    }
                  }).done((data, textStatus) => {
                    console.debug(textStatus, requestPayload, data);
                  }).fail((xhr, textStatus, errorThrown) => {
                    console.error(textStatus, xhr, errorThrown);
                    alert(`Download failed with following reason: ${textStatus}`);
                  });
                });
              }
            });
          });
        } else {
          console.error('Missing settings', result);
        }
      });
    }
  });
});
