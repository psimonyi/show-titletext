/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This script requires findCssSelector (from css-selector.js) to actually get
// the CSS selector from a DOM node.  That comes from Firefox DevTools:
// https://hg.mozilla.org/mozilla-central/raw-file/tip/toolkit/modules/css-selector.js

// The contextMenus API doesn't actually tell us what element got clicked.  So
// we have to hack aroud this by looking for an image with the right src
// attribute, hoping there's only one of those.  And the URL we get is *already
// resolved* so we can't even just search by attribute text directly.

browser.runtime.onMessage.addListener(url => {
    let images = document.querySelectorAll('img');
    for (let img of images) {
        if (img.currentSrc === url) {
            let selector = cssSelector(img);
            return Promise.resolve({[document.domain]: selector});
        }
    }
    return Promise.reject("Can't find the image");
});

// The findCssSelector function assumes it has chrome privileges.  This wrapper
// fakes the stuff it relies on.
function cssSelector(node) {
    Element.prototype.ownerGlobal = window;
    document.getBindingParent = function () { return null; };
    return findCssSelector(node);
}
