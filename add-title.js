/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function addTitle(selector) {
    let comic = document.querySelector(selector);
    if (!comic) {
        console.warn("Show title-text extension: selector didn't match:",
            selector);
        return;
    }

    let p = document.createElement('p');
    p.textContent = comic.getAttribute('title');
    p.classList.add('title-text');

    // If the IMG is in a link, position the text relative to the link instead.
    let dest = comic;
    for (let elem = comic; elem.parentElement; elem = elem.parentElement) {
        if (elem.localName == 'a' && elem.href) {
            dest = elem;
        }
    }
    dest.insertAdjacentElement('afterend', p);
}

(() => {
    let domain = location.host;
    browser.storage.sync.get(domain).then(results => {
        addTitle(results[domain]);
    }).catch(e => {
        console.error("Show title-text extension error:", e);
    });
})();
