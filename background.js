function addListener() {
    browser.storage.sync.get().then(conf => {
        let filter = Object.keys(conf).map(domain => ({hostEquals: domain}));
        if (filter.length == 0) return;
        browser.webNavigation.onDOMContentLoaded.addListener(handler,
            {url: filter});
    });
}

addListener();

// There's no way to change the listener's filter, so on change we just add the
// listener all over again.
browser.storage.onChanged.addListener(changes => {
    browser.webNavigation.onDOMContentLoaded.removeListener(handler);
    addListener();
});

function handler(details) {
    browser.tabs.executeScript(details.tabId, {
        frameId: details.frameId,
        runAt: 'document_end',
        file: 'add-title.js',
    });
    browser.tabs.insertCSS(details.tabId, {
        frameId: details.frameId,
        runAt: 'document_end',
        file: 'title.css',
    });
}
