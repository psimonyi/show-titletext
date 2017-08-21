document.addEventListener('DOMContentLoaded', init);
function init() {
    let table = document.querySelector('tbody');
    browser.storage.sync.get().then(conf => {
        for (let [domain, selector] of Object.entries(conf)) {
            table.appendChild(makeRow(domain, selector));
        }
    });

    document.getElementById('new-rule').addEventListener('click', newRule);
}

function makeRow(domain, selector) {
    let tr = document.createElement('tr');
    let tdDomain = document.createElement('td');
    let tdSelector = document.createElement('td');
    let tdDelete = document.createElement('td');
    let inputSelector = document.createElement('input');
    let deleteButton = document.createElement('button');
    inputSelector.value = selector;
    inputSelector.addEventListener('change', onChange);
    deleteButton.type = 'button';
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', onDelete);
    tdDomain.textContent = domain;
    tdSelector.appendChild(inputSelector);
    tdDelete.appendChild(deleteButton);
    tr.appendChild(tdDomain);
    tr.appendChild(tdSelector);
    tr.appendChild(tdDelete);
    tr.dataset.domain = domain;
    return tr;
}

/* User changed the selector text */
function onChange(event) {
    let domain = this.parentElement.parentElement.dataset.domain;
    browser.storage.sync.set({[domain]: this.value});
}

/* User clicked the Delete button for a row */
function onDelete(event) {
    let domain = this.parentElement/*td*/.parentElement/*tr*/.dataset.domain;
    browser.storage.sync.remove(domain);
}

/* User clicked the New Rule button */
function newRule() {
    let input = document.getElementById('new-domain');
    let domain = input.value;
    if (domain == '') {
        alert("Enter a domain name.");
        return;
    }
    browser.storage.sync.get(domain).then(results => {
        if (results.hasOwnProperty(domain)) {
            alert("There is already a setting for the domain " + domain);
        } else {
            let table = document.querySelector('tbody');
            table.appendChild(makeRow(domain, ""));
            input.value = '';
        }
    });
}

browser.storage.onChanged.addListener(reload);
function reload(changes, areaName) {
    for (let [domain, change] of Object.entries(changes)) {
        // The selector syntax would require escaping ", \, and newline.  Since
        // those aren't valid in domains, just verify that they're absent.
        if (domain.match(/["\\\n]/)) {
            console.error("Domain name contains weird characters!");
            return;
        }
        let row = document.querySelector(`tr[data-domain="${domain}"]`);
        let selector = change.newValue;
        if (selector === undefined) {
            row.parentElement.removeChild(row);
        } else {
            if (row) {
                let input = row.querySelector('input');
                input.value = selector;
            } else {
                let table = document.querySelector('tbody');
                table.appendChild(makeRow(domain, selector));
            }
        }
    }
}
