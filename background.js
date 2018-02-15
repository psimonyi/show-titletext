/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

addLoadListeners();
initContextMenu();
initPageAction();

function addLoadListeners() {
    browser.storage.sync.get().then(conf => {
        let filter = Object.keys(conf)
            .filter(key => !key.startsWith(':'))
            .map(domain => ({hostEquals: domain}));
        if (filter.length == 0) return;
        browser.webNavigation.onDOMContentLoaded.addListener(handler,
            {url: filter});
    });
}

// There's no way to change the listener's filter, so on change we just add the
// listener all over again.
browser.storage.onChanged.addListener(changes => {
    browser.webNavigation.onDOMContentLoaded.removeListener(handler);
    addLoadListeners();
    if (changes[':show-context-menu']) initContextMenu();
    if (changes[':offer-page-action']) initPageAction();
});

function handler(details) {
    // Don't run in framed documents; they probably aren't the main page.
    if (details.frameId && details.frameId > 0) return;

    browser.tabs.executeScript(details.tabId, {
        runAt: 'document_end',
        file: 'add-title.js',
    });
    browser.tabs.insertCSS(details.tabId, {
        runAt: 'document_end',
        file: 'title.css',
    });
}


// Context menu:

function initContextMenu() {
    if (!browser.menus) return; // bail if the API isn't available.
    browser.storage.sync.get(':show-context-menu').then(conf => {
        if (conf[':show-context-menu'] !== false) {
            browser.menus.create({
                contexts: ['image'],
                title: "Set title-text rule with this image",
            });
        } else {
            browser.menus.removeAll();
        }
    });
}

if (browser.menus) {
    browser.menus.onClicked.addListener((info, tab) => {
        browser.tabs.executeScript(tab.id, {
            file: 'css-selector.js',
            runAt: 'document_end',
        }).catch(() => { /* ignore errors */ }).then(() => {
            browser.tabs.executeScript(tab.id, {
                file: 'get-image-selector.js',
                runAt: 'document_end',
            }).then(() => {
                browser.tabs.sendMessage(tab.id, {
                    cmd: 'rule-for-image',
                    url: info.srcUrl
                }).then(rule => {
                    browser.storage.sync.set(rule);
                    handler({tabId: tab.id});
                });
            });
        });
    });
}


// Page action:

// Return a promise of whether the :offer-page-action option is enabled.
// When 'setting' is defined, return that; otherwise return the default.
// On Android it's enabled by default (because there are no context menus!).
// Elsewhere it's disabled by default.
function pageActionEnabled(setting) {
    if (setting !== undefined) return Promise.resolve(setting);
    return browser.runtime.getPlatformInfo().then(info => {
        return info.os === 'android' ? true : false;
    });
}

function initPageAction() {
    browser.storage.sync.get(':offer-page-action').then(conf => {
        pageActionEnabled(conf[':offer-page-action']).then(enabled => {
            if (enabled) {
                browser.webNavigation.onCompleted.addListener(offerAction);
            } else {
                browser.webNavigation.onCompleted.removeListener(offerAction);
            }
        });
    });
}

// webNavigation.onCompleted handler
function offerAction(details) {
    if (details.frameId > 0) return; // We'll just ignore frames.
    let domain = new URL(details.url).host;
    browser.storage.sync.get(domain).then(result => {
        if (result[domain]) return;
        browser.tabs.executeScript(details.tabId, {
            file: 'get-image-selector.js',
            runAt: 'document_idle',
        }).then(() => {
            browser.tabs.sendMessage(details.tabId, {
                cmd: 'check-offer'
            }).then(offer => {
                if (offer) {
                    browser.pageAction.show(details.tabId);
                }
            });
        });
    });
}

browser.pageAction.onClicked.addListener(tab => {
    browser.pageAction.hide(tab.id);
    browser.tabs.executeScript(tab.id, {
        file: 'css-selector.js',
        runAt: 'document_end',
    }).catch(() => { /* ignore errors */ }).then(() => {
        browser.tabs.sendMessage(tab.id, {
            cmd: 'get-offer',
        }).then(rule => {
            console.log(rule);
            browser.storage.sync.set(rule);
            handler({tabId: tab.id});
        });
    });
});
