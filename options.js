/**
 * Get an object of id/value pairs of the current form state.
 *
 * @return {object}
 */
function getSettingsFromForm() {
  const formValues = {};

  // Grab all settings storage selectors.
  $('input.input-field, .input-field input, textarea.input-field, .input-field textarea').each((idx, formControl) => {
    const $formControl = $(formControl);
    switch ($formControl.attr('type')) {
      case 'textarea':
        formValues[$formControl.attr('id')] = $formControl.text();
        break;
      default:
        formValues[$formControl.attr('id')] = $formControl.val();
        break;
    }
  });

  return formValues;
}

/**
 * Save settings to chrome storage.
 */
function saveSettings() {
  chrome.storage.sync.set(getSettingsFromForm(), () => {
    if (chrome.runtime.lastError == undefined || chrome.runtime.lastError == null)
      M.toast({html: _('settings_save_success'), classes: 'green darken-1'});
    else
      M.toast({html: _('settings_save_error') + `: ${chrome.runtime.lastError.toString()}`, classes: 'red darken-1'});
  });
}

/**
 * Load settings from chrome storage.
 */
function loadSettings() {
  chrome.storage.sync.get(getSettingsFromForm(), (result) => {
    for (let id in result) $('#' + id).val(result[id]);
    M.updateTextFields();
  });
}

/**
 * Save settings on button click
 */
$('#save').on('click', (e) => {
  saveSettings();
  // chrome.extension.getBackgroundPage().optionsFormValues = formValues;
});


/**
 * DOM initialized
 */
$(document).ready(() => {
  // Disable form submit.
  $('form').submit(false);
  // Load current settings.
  setTimeout(loadSettings, 150);
});
