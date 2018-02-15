/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// If this file is included more than once, skip it after the first.
if (!_get_image_selector_js) {

// This script requires findCssSelector (from css-selector.js) to actually get
// the CSS selector from a DOM node.  That comes from Firefox DevTools:
// https://hg.mozilla.org/mozilla-central/raw-file/tip/toolkit/modules/css-selector.js
//
// The findCssSelector function assumes it has chrome privileges.  This wrapper
// fakes the stuff it relies on.
function cssSelector(node) {
    Element.prototype.ownerGlobal = window;
    document.getBindingParent = function () { return null; };
    return findCssSelector(node);
}

// This script handles making the image selector rules, which can happen with
// the context menu or the page action.
// Context menu: this script runs when the menu entry is clicked; we expect a
//     'rule-for-image' message.
// Page action: this script runs when the page finishes loading; we expect a
//     'check-offer' message to decide whether to offer the action;
//     later we may get a 'get-offer' message to actually make the rule.

browser.runtime.onMessage.addListener(dispatcher);
function dispatcher(message) {
    if (message.cmd === 'rule-for-image') {
        return makeRuleForImage(message.url);
    } else if (message.cmd === 'check-offer') {
        return checkOfferAction();
    } else if (message.cmd === 'get-offer') {
        return getOfferedRule();
    } else {
        console.error("Unrecognized message", message);
        return Promise.reject("Unrecognized message");
    }
}

// The contextMenus API doesn't actually tell us what element got clicked.  So
// we have to hack aroud this by looking for an image with the right src
// attribute, hoping there's only one of those.  And the URL we get is *already
// resolved* so we can't even just search by attribute text directly.
// Return a promise of the rule for the selected image.
function makeRuleForImage(url) {
    let images = document.querySelectorAll('img');
    for (let img of images) {
        if (img.currentSrc === url) {
            let selector = cssSelector(img);
            return Promise.resolve({[location.host]: selector});
        }
    }
    return Promise.reject("Can't find the image");
}

// Return a promise of whether we can find an image that might be a comic, i.e.
// whether we should offer the page action to add a rule.
function checkOfferAction() {
    let candidates = [];
    for (let img of document.images) {
        // Find images that have a title, cross the centre line of the screen
        // horizontally, and are above the fold vertically.
        if (img.title) {
            let rect = img.getBoundingClientRect();
            let centre = window.innerWidth / 2;
            if (rect.x < centre && centre < rect.x + rect.width
                    && rect.y <  window.innerHeight) {
                candidates.push(img);
            }
        }
    }
    if (candidates.length === 0) return Promise.resolve(false);
    if (candidates.length > 1) console.log("Candidate comics:", candidates);
    // Choose the candiate with the greatest area.
    offered_image = candidates.reduce(
        (a, b) => a.width * a.height > b.width * b.height ? a : b);
    return Promise.resolve(true);
}

// Cache the offered image between when we find it and when the user decides to
// add a rule.
var offered_image;

// Return a promise of the rule for the image we guessed in checkOfferAction().
function getOfferedRule() {
    let comic = offered_image;
    let selector = cssSelector(comic);
    return Promise.resolve({[location.host]: selector});
}

// If this file is included more than once, skip it after the first.
}
var _get_image_selector_js = true;
