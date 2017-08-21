function addTitle(selector) {
    let comic = document.querySelector(selector);
    let p = document.createElement('p');
    p.textContent = comic.getAttribute('title');
    p.classList.add('title-text');

    // If the IMG is in a link, position the text relative to the link instead.
    let dest = comic;
    for (let elem = comic; elem.parentElement; elem = elem.parentElement) {
        if (elem.localName == 'A' && elem.href) {
            dest = elem;
        }
    }
    dest.insertAdjacentElement('afterend', p);
}

let domain = document.location.hostname;
browser.storage.sync.get(domain).then(results => {
    addTitle(results[domain]);
}).catch(e => {
    console.error("Show title-text extension error:", e);
});
