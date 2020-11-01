let cookieList = [];
let downloadList = [];
let autoUpdateDownloadList = true;
let autoUpdateDownloadListNext = null;

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
  const listView = $('#downloadList').html('');
  if (downloadList.length > 0) {
    downloadList.forEach((download) => {
      let downloadView = $(getDownloadView(download.id));
      const downloadDst = download.destination ? download.destination.split('/') : download.url;

      downloadView.append($(`<h4>${downloadDst[downloadDst.length - 1]}</h4>`))
                  .append(getProgressTextView(download));

      const downloadStatus = Download.Status.indexOf(download.status);
      let progressBarClass = 'indeterminate';
      let progressBarStyle = '';

      if (downloadStatus > 5) {
        progressBarClass = 'determinate red darken-4';
        progressBarStyle += 'width: 100%;'
      } else if (downloadStatus > 4) {
        progressBarClass = 'determinate green darken-1';
        progressBarStyle += 'width: 100%;'
      } else if (downloadStatus > 3) {
        progressBarClass += ' blue darken-4';
      } else if (downloadStatus > 2) {
        progressBarClass = 'determinate blue darken-4';
        progressBarStyle += `width: ${Number(Number(download.progress) * 100).toFixed(2)}%;`;
      } else {
        progressBarClass += ' blue darken-4';
      }

      downloadView.append($(`<div class="progress"><div class="${progressBarClass}" style="${progressBarStyle}"></div></div>`));

      if ('PROGRESSING' === download.status) {
        downloadView.prepend($(`<a class="waves-effect waves-light orange-text text-darken-1 right" data-function="pause" data-id="${download.id}"><i class="material-icons">pause</i></a>`));
      }
      if (['PAUSED', 'ABORTED', 'FAILED'].indexOf(download.status) >= 0) {
        downloadView.prepend($(`<a class="waves-effect waves-light green-text text-darken-1 right" data-function="resume" data-id="${download.id}"><i class="material-icons">play_arrow</i></a>`));
      }
      if (['FAILED', 'PAUSED', 'PROGRESSING', 'SUCCEEDED'].indexOf(download.status) >= 0) {
        downloadView.prepend($(`<a class="waves-effect waves-light red-text text-darken-1 right" data-function="abort" data-id="${download.id}"><i class="material-icons">stop</i></a>`));
      }
      if (['SUCCEEDED', 'FAILED', 'ABORTED'].indexOf(download.status) >= 0) {
        downloadView.prepend($(`<a class="waves-effect waves-light red-text text-darken-1 right" data-function="remove" data-id="${download.id}"><i class="material-icons">remove_circle_outline</i></a>`));
      }

      listView.append(downloadView);
    });
  } else {
    const noDownloadsListed = $(`<div class="">${_('no_downloads_listed')}</div>`);
    listView.append(noDownloadsListed);
  }

  $('a[data-function]').on('click', (event) => {
    const func = $(event.currentTarget).data('function');
    const id = $(event.currentTarget).data('id');
    downloadAction(func, id);
  });
}

function downloadAction(action, id) {
  const baseUrl = settings.remote_target.endsWith('/') ? settings.remote_target : (settings.remote_target + '/');

  $.ajax(baseUrl + action, {
    type: 'POST',
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify({ids: [id]}),
    beforeSend: (xhr) => {
      if ('username' in settings && 'password' in settings &&
        settings.username.length > 0 && settings.password.length > 0
      ) {
        console.info('Adding authorization header');
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(settings.username + ':' + settings.password));
      }
    },
  }).done((data, textStatus) => {
    M.toast({html: textStatus, classes: 'green darken-1'});
  }).fail((xhr, textStatus, errorThrown) => {
    console.error(textStatus, xhr, errorThrown);
    M.toast({html: `${xhr.responseJSON.error}: ${xhr.responseJSON.message}`, classes: 'red darken-1'});
  });
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
      $('#downloadCounter').html(`(${data.currentDownloads.length > 0 ? data.currentDownloads.length + '/' : ''}${data.downloads.length})`)
      updateDownloadListView();
    }
  }).fail((xhr, textStatus, errorThrown) => {
    console.error('Error getting download list', textStatus);
    console.debug(textStatus, xhr, errorThrown);
  }).always(() => {
    if (autoUpdateDownloadList) {
      autoUpdateDownloadListNext = setTimeout(updateDownloadList, 300);
    }
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

  updateDownloadList();

  loadSettings();
  $('#sendToRemote').on('click', delegateDownload);

  setInterval(updateCookieListView, 1000);

  $('#toggleAutoRefresh').on('click', (e) => {
    autoUpdateDownloadList = !autoUpdateDownloadList;
    if (autoUpdateDownloadList) {
      $('#toggleAutoRefresh').addClass('blue-text text-darken-1').removeClass('grey-text text-darken-2');
      periodicUpdateDownloadList();
    } else {
      $('#toggleAutoRefresh').addClass('grey-text text-darken-2').removeClass('blue-text text-darken-1');
      clearTimeout(autoUpdateDownloadListNext);
      autoUpdateDownloadListNext = null;
    }
  });

  $('#refresh').on('click', (e) => {
    updateDownloadList();
  });
});
