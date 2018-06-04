# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

.PHONY: default
default: show-titletext.xpi

files := action-icon-16.png action-icon-32.png action-icon-warning-16.png \
    action-icon-warning-32.png add-title.js background.js css-selector.js \
    get-image-selector.js manifest.json options.css options.html options.js \
    README.md title.css warning.css warning.html

action-icon-%.png: action-icon.svg
	inkscape --export-png=$@ --export-width=$* --file=$<

action-icon-warning-%.png: action-icon-warning.svg
	inkscape --export-png=$@ --export-width=$* --file=$<

show-titletext.xpi: $(files)
	zip --filesync -n .png --quiet $@ $^
