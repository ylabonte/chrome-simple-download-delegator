let cookieList = [];

/**
 * Update the collected cookies list.
 */
function updateCookiesList() {
  const url = $('#objectUrl').val();
  if (!isUrl(url)) return;

  // let a = document.createElement('a');
  // a.href = url;
  // console.log(a.hostname);

  chrome.tabs.query({ currentWindow: true, active : true }, (tabs) => {
    let activeTab = tabs[0].id;
    chrome.cookies.getAllCookieStores((cookieStores) => {
      cookieStores.forEach((cookieStore) => {
        if (cookieStore.tabIds.indexOf(activeTab) >= 0) {
          chrome.cookies.getAll({ storeId: cookieStore.id, url: url }, (cookies) => {
            cookies.forEach((cookie) => {
              cookieList.push(cookie);
            });
          });
        }
      });
    });
  });
}

function updateCookieListView() {
  if (cookieList.length > 0) {
    $('#cookiesOut > code').html('');
    $('#cookiesOut > progress').show();
    cookieList.forEach(cookie => {
      $('#cookiesOut > progress').hide();
      $('#cookiesOut > code').append(
        `${cookie.domain}${cookie.path}: ${cookie.name}="${decodeURIComponent(cookie.value)}"<br>\n`
      );
    });
  } else {
    $('#cookiesOut > progress').hide();
    $('#cookiesOut > code').html(_('none'));
  }
}

/**
 * Send download to remote service.
 */
function delegateDownload() {
  let requestPayload = [{
    url: $('#objectUrl').val(),
    header: [
      `User-Agent: ${navigator.userAgent}`,
      `Cookie: ${cookieList.map(cookie => `${cookie.name}=${cookie.value};`).join('')}`,
    ],
  }];
  chrome.storage.sync.get(['remote_target', 'username', 'password'], (result) => {
    console.log(result);
    if ('remote_target' in result) {
      let settings = result;
      let url = settings.remote_target;
      $.ajax(url, {
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify(requestPayload),
        beforeSend: (xhr) => {
          if ('username' in settings && 'password' in settings &&
            settings.username.length > 0 && settings.password.length > 0
          ) {
            console.info('Adding authorization header');
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(settings.username + ':' + settings.password));
          }
        },
      }).done((data, textStatus) => {
        console.info(data);
        console.debug(requestPayload);
        M.toast({html: textStatus, classes: 'green darken-1'});
      }).fail((xhr, textStatus, errorThrown) => {
        console.error(textStatus, xhr, errorThrown);
        M.toast({html: `${xhr.responseJSON.error}: ${xhr.responseJSON.message}`, classes: 'red darken-1'});
      });
    } else {
      console.error('Missing settings');
    }
  });
}

/**
 * Initialize popup.
 */
$(document).ready(() => {
  setTimeout(updateCookiesList, 500);
  $('#objectUrl').on('change', () => {
    updateCookiesList();
  });

  $('#sendToRemote').on('click', delegateDownload);

  setInterval(updateCookieListView, 1000);
  //@todo Poll for status and set the badge counter according to the number of downloads in progress.
  // chrome.browserAction.setBadgeText({text: '0'});
  // chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
});
