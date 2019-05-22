let cookieList = [];
let downloadList = [];

/**
 * Update the collected cookies list.
 */
function updateCookiesList() {
  const url = $('#objectUrl').val();
  if (!isUrl(url)) return;

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

function getDownloadView(id) {
  let downloadView = $('#downloadList').find('#download' + id).get(0);
  if (!downloadView) {
    downloadView = $(`<li class="download" id="download${id}"></li>`);
  }

  return downloadView;
}

function getDisplaySizeView(download) {
  const displaySizeView = $('<span class="display-size right"></span>').append(
    $(`<span class="size">${download.humanReadableSize}</span>`)
  );

  if (Number(download.progress) < 1 && download.humanReadableFileSize !== undefined) {
    displaySizeView.prepend(`<span class="filesize">${download.humanReadableFileSize} of </span>`);
  }

  return displaySizeView;
}

function getProgressTextView(download) {
  const progress = Number(download.progress) * 100;
  const progressTextView = $(`<div class="right right-align text-grey text-lighten-1"><span>`);

  const displaySizeView = $('<span class="display-size"></span>').append(
    $(`<span class="size">${download.humanReadableSize}</span>`)
  );

  if (progress < 100 && Number(download.fileSize) > 0) {
    displaySizeView.prepend(`<span class="filesize">${download.humanReadableFileSize} of </span>`);
  }

  const progressText = $(`<span class="progressText">${progress.toPrecision(3)}&nbsp;%</span>`);
  if (progress > 0 && progress < 100) {
    progressText.append($(`<span> at ${download.humanReadableSpeed}</span>`));
  }

  return progressTextView.append(displaySizeView)
                         .append($('<span class="spacer"> - </span>'))
                         .append(progressText);
}

function getProgressBarView(download) {
  const downloadStatus = Download.Status.indexOf(download.status);
  let progressBarClass = 'indeterminate';
  let progressBarStyle = '';

  if (downloadStatus > 2) {
    progressBarClass = 'determinate';
  }

  if (downloadStatus > 4) {
    progressBarClass += ' red darken-4';
    progressBarStyle += 'width: 100%;'
  } else if (downloadStatus > 3) {
    progressBarClass += ' green darken-1';
    progressBarStyle += 'width: 100%;'
  } else {
    progressBarClass += ' blue darken-4';
    progressBarStyle += `width: ${Number(Number(download.progress) * 100).toFixed(2)}%;`;
  }

  return $(`<div class="progress"><div class="${progressBarClass}" style="${progressBarStyle}"></div></div>`);
}

function updateDownloadListView() {
  if (downloadList.length > 0) {
    const listView = $('#downloadList').html('');
    downloadList.forEach((download) => {
      let downloadView = $(getDownloadView(download.id));
      const downloadDst = download.destination.split('/');
      const downloadProgress = (Number(download.progress) * 100).toPrecision(3);

      downloadView.append($(`<h4>${downloadDst[downloadDst.length - 1]}</h4>`))
                  .append(getProgressTextView(download))
                  .append(getProgressBarView(download));
      listView.append(downloadView);
    });
  }
}

/**
 * Send download to remote service.
 */
function delegateDownload() {
  let url = settings.remote_target;
  let requestPayload = [{
    url: $('#objectUrl').val(),
    header: [
      `User-Agent: ${navigator.userAgent}`,
      `Cookie: ${cookieList.map(cookie => `${cookie.name}=${cookie.value};`).join('')}`,
    ],
  }];

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
}

function updateDownloadList() {
  $.ajax(settings.remote_target, {
    type: 'GET',
    beforeSend: (xhr) => {
      if ('username' in settings && 'password' in settings &&
        settings.username.length > 0 && settings.password.length > 0
      ) {
        console.info('Adding authorization header');
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(settings.username + ':' + settings.password));
      }
    },
  }).done((data, textStatus) => {
    if (data.downloads !== undefined) {
      downloadList = data.downloads;
      // chrome.browserAction.setBadgeText({text: data.currentDownloads.length});
      $('#downloadCounter').html(`(${data.currentDownloads.length > 0 ? data.currentDownloads.length + '/' : ''}${data.downloads.length})`)
      updateDownloadListView();
    }
  }).fail((xhr, textStatus, errorThrown) => {
    console.error('Error getting download list', textStatus);
    console.debug(textStatus, xhr, errorThrown);
  });
}

/**
 * Initialize popup.
 */
$(document).ready(() => {
  M.AutoInit();
  setTimeout(updateCookiesList, 500);
  $('#objectUrl').on('change', () => {
    updateCookiesList();
  });

  const periodicUpdateDownloadList = () => {
    updateDownloadList();
    updateDownloadListView();
    setTimeout(periodicUpdateDownloadList, 1000);
  };
  periodicUpdateDownloadList();

  loadSettings();
  $('#sendToRemote').on('click', delegateDownload);

  setInterval(updateCookieListView, 1000);
  //@todo Poll for status and set the badge counter according to the number of downloads in progress.
  // chrome.browserAction.setBadgeText({text: '0'});
  // chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
});
