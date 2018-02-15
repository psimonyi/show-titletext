# Show comic title-text

Show the title-text below a comic page.  Instead of having to hover the mouse
to read it, the text is just there already.  Actually, it doesn't have to be a
comic — you can turn this on for any domain.

This is a WebExtension for Firefox.  Android is now supported, though some
features are limited or disabled as some WebExtension APIs are not implemented
there yet.

## Usage

Since many images have title-text, you have to set which image on which domains
is a comic with interesting title-text.  The easy way to add rules is with the
context menu: right-click on a comic and pick "Set title-text rule with this
image".  Context menus are not available in Firefox for Android.

The extension can guess what rule should be added and offer a page action icon
(in the location bar).  This is disabled by default because it may slow down
page loading (and the guessing will not be as good as just right-clicking on
the comic), except on Android where it is the only convenient way to add rules.

You can edit (or manually create) rules in the add-on preferences.  Each domain
is associated with a CSS selector identifying the comic image.  For example,
`#comic > img` would work for xkcd.com.

Once you've finished adding most rules, you can remove the context menu entry
or disable the page action from the add-on preferences.

## Know your rights

This extension is Free Software, made available under the terms of the [Mozilla
Public License, version 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

You can get the source code at https://github.com/psimonyi/show-titletext
