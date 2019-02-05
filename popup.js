const updateCookiesList = url => {
  /**
   * Gather cookies for active tab
   */
  let a = document.createElement('a');
  a.href = url;
  let domainFilter = a.hostname.replace(/.*\.(.*)\..*$/i, '$1');
  let domains = document.cookieCache.getDomains(domainFilter);
  if (domains.length) {
    $('#cookiesOut').html('');
    document.cookiesArray = [];
    domains.forEach(domain => {
      let cookies = document.cookieCache.getCookies(domain);
      cookies.forEach(cookie => {
        document.cookiesArray.push(cookie);
        $('#cookiesOut').append(
          (cookie.secure ? 'https://' : '') + (cookie.httpOnly ? 'http://' : '') +
          (cookie.domain.startsWith('.') ? '*' : '') + cookie.domain + cookie.path + ' : ' +
          cookie.name + ' = ' + cookie.value + ";<br>\n"
        );
      });
    });
  } else {
    $('#cookiesOut').html(chrome.i18n.getMessage('none'));
  }
};

$('#objectUrl').on('focus', () => {
  updateCookiesList($('#objectUrl').val());
});
$('#objectUrl').on('change', () => {
  updateCookiesList($('#objectUrl').val());
});

$('#sendToRemote').on('click', () => {
  let requestPayload = {
    url: $('#objectUrl').val(),
    header: {
      cookie: ''
    },
    userAgent: navigator.userAgent,
    cookies: document.cookiesArray
  };
  document.cookiesArray.forEach(cookie => {
    requestPayload.header.cookie += cookie.name + '=' + cookie.value + ';';
  });
  console.log(requestPayload);
});

chrome.browserAction.setBadgeText({text: '0'});
chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});

