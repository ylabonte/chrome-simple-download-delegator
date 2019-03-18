let cookieList = [];

/**
 * Update the collected cookies list.
 */
function updateCookiesList() {
  const url = $('#objectUrl').val();
  if (!isUrl(url)) return;

  let a = document.createElement('a');
  a.href = url;
  // let domainFilter = a.hostname.replace(/.*\.(.*)\..*$/i, '$1');
  chrome.cookies.getAll({url: url}, (cookies) => {
    cookieList = cookies;
    if (cookies.length > 0) {
      $('#cookiesOut > code').html('');
      $('#cookiesOut > progress').show();
      cookies.forEach(cookie => {
        $('#cookiesOut > progress').hide();
        $('#cookiesOut > code').append(
          (cookie.secure ? 'https://' : '') + (cookie.httpOnly ? 'http://' : '') +
          (cookie.domain.startsWith('.') ? '*' : '') + cookie.domain + cookie.path + ': ' +
          cookie.name + '= ' + decodeURIComponent(cookie.value) + ";<br>\n"
        );
      });
    } else {
      $('#cookiesOut > progress').hide();
      $('#cookiesOut > code').html(_('none'));
    }
  });
}

/**
 * Send download to remote service.
 */
function delegateDownload() {
  console.log(cookieList);
  let requestPayload = {
    url: $('#objectUrl').val(),
    header: [
      `User-Agent: ${navigator.userAgent}`,
      `Cookie: ${cookieList.map(cookie => `${cookie.name}=${cookie.value};`).join('')}`,
    ],
  };
  console.log(requestPayload);
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

  //@todo Poll for status and set the badge counter according to the number of downloads in progress.
  // chrome.browserAction.setBadgeText({text: '0'});
  // chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
});
