/**
 * Insert messages
 */
const _ = chrome.i18n.getMessage;
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

/**
 * Insert current values
 */
$('.form-control').each((idx, formControl) => {
  let $formControl = $(formControl);
  if ($formControl.attr('id')) {
    chrome.storage.sync.get([$formControl.attr('id')], (result) => {
      switch ($formControl.attr('type')) {
        case 'textarea':
          $formControl.text(result[$formControl.attr('id')]);
          break;
        default:
          $formControl.val(result[$formControl.attr('id')]);
          break;
      }
    })
  }
});

/**
 * Save on click
 */
$('#save').on('click', (e) => {
  let formValues = {};

  $('.form-control').each((idx, formControl) => {
    let $formControl = $(formControl);
    switch ($formControl.attr('type')) {
      case 'textarea':
        formValues[$formControl.attr('id')] = $formControl.text();
        break;
      default:
        formValues[$formControl.attr('id')] = $formControl.val();
        break;
    }

    chrome.storage.sync.set(formValues);
    chrome.extension.getBackgroundPage().optionsFormValues = formValues;
  })
});
