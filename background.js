chrome.runtime.onInstalled.addListener(() => {

  // chrome.storage.sync.set({setting_amazon_domains: 'amazon.com;amazon.de'}, () => {
  //   console.log(chrome.i18n.getMessage('log_set_amazon_domain_suffix', ['amazon.com;amazon.de']))
  // })

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.storage.sync.get(['setting_amazon_domains'], (result) => {
      console.log(`got setting_amazon_domains '${result.setting_amazon_domains}'`)
      let conditions = []
      let domains = result.setting_amazon_domains.split(';')
      for (let idx in domains) {
        conditions.push(
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostSuffix: domains[idx].trim()}
          })
        )
      }

      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: conditions,
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }])
    })
  })

  chrome.browserAction.setBadgeText({text: 'ON'})
  chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'})
})
