# Changelog

## 2.2.1

### Fixes

- Escape logos to prevent XSS vulnerability
- Update docblock for BadgeFactory.create()

## 2.2.0 - 2019-05-29

### Deprecations

- `labelColor` and `color` are now the recommended attribute names for label color and message color.

  - `colorA` (now an alias for `labelColor`),
  - `colorB` (now an alias for `color`) and
  - `colorscheme` (now an alias for `color`)

  are now deprecated and will be removed in some future release.

### New Features

- Semantic color aliases. Add support for:
  - ![success](https://img.shields.io/badge/success-success.svg)
  - ![important](https://img.shields.io/badge/important-important.svg)
  - ![critical](https://img.shields.io/badge/critical-critical.svg)
  - ![informational](https://img.shields.io/badge/informational-informational.svg)
  - ![inactive](https://img.shields.io/badge/inactive-inactive.svg)
- Add directory field to package.json (to help tools find this package in the repo)

### Bug Fixes

- Prevent bad letter spacing when whitespace surrounds badge text

### Dependencies

- Bump anafanafo
- Use caret instead of tilde for dependencies

### Internals

- Generate JSON badges without using a template
- Refactoring
- Testing improvements

### Node support

- Declare support for all currently maintained Node versions
- Explicitly test on all supported versions

## 2.1.0 - 2018-11-18

gh-badges v2.1.0 implements a new text width measurer which uses a lookup table, removing the dependency
on PDFKit. It is no longer necessary to provide a local copy of Verdana for accurate text width computation.

As such, the `fontPath` and `precomputeWidths` parameters are now deprecated. The recommended call to create an instance of `BadgeFactory` is now

```js
const bf = new BadgeFactory()
```

For backwards compatibility you can still construct an instance of `BadgeFactory` with a call like

```js
const bf = new BadgeFactory({
  fontPath: '/path/to/Verdana.ttf',
  precomputeWidths: true,
})
```

However, the function will issue a warning.

To clear the warning, change the code to:

```js
const bf = new BadgeFactory()
```

These arguments will be removed in a future release.

To upgrade from v1.3.0, change your code from:

```js
const badge = require('gh-badges')

const format = {
  text: ['build', 'passed'],
  colorscheme: 'green',
  template: 'flat',
}

badge.loadFont('/path/to/Verdana.ttf', err => {
  badge(format, (svg, err) => {
    // svg is a string containing your badge
  })
})
```

to:

```js
const { BadgeFactory } = require('gh-badges')

const bf = new BadgeFactory()

const format = {
  text: ['build', 'passed'],
  colorscheme: 'green',
  template: 'flat',
}

const svg = bf.create(format)
```

### Other changes in this release:

- Remove unnecessary dependencies
- Documentation improvements

## 2.0.0 - 2018-11-09

gh-badges v2.0.0 declares a new public interface which is synchronous.
If your version 1.3.0 code looked like this:

```js
const badge = require('gh-badges')

const format = {
  text: ['build', 'passed'],
  colorscheme: 'green',
  template: 'flat',
}

badge.loadFont('/path/to/Verdana.ttf', err => {
  badge(format, (svg, err) => {
    // svg is a string containing your badge
  })
})
```

To upgrade to version 2.0.0, refactor you code to:

```js
const { BadgeFactory } = require('gh-badges')

const bf = new BadgeFactory({ fontPath: '/path/to/Verdana.ttf' })

const format = {
  text: ['build', 'passed'],
  colorscheme: 'green',
  template: 'flat',
}

const svg = bf.create(format)
```

You can generate badges without a copy of Verdana, however font width computation is approximate and badges may be distorted.

```js
const bf = new BadgeFactory({ fallbackFontPath: 'Helvetica' })
```

## 1.3.0 - 2016-09-07

Add support for optionally specifying the path to `Verdana.ttf`. In earlier versions, the file needed to be in the directory containing Shields.

Without font path:

```js
const badge = require('gh-badges')

badge({ text: ['build', 'passed'], colorscheme: 'green' }, (svg, err) => {
  // svg is a string containing your badge
})
```

With font path:

```js
const badge = require('gh-badges')

// Optional step, to have accurate text width computation.
badge.loadFont('/path/to/Verdana.ttf', err => {
  badge(
    { text: ['build', 'passed'], colorscheme: 'green', template: 'flat' },
    (svg, err) => {
      // svg is a string containing your badge
    }
  )
})
```
