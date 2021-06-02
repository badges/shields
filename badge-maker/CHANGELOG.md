# Changelog

## 3.3.1

- Improve font measuring in for-the-badge and social styles
- Make for-the-badge letter spacing more predictable

## 3.3.0

- Readability improvements: a dark font color is automatically used when the badge's background is too light. For example: ![](https://img.shields.io/badge/hello-world-white)
- Better CSS color compliance: thanks to a switch from _is-css-color_ to _[css-color-converter](https://www.npmjs.com/package/css-color-converter)_, you can use a wider range of color formats from the latest CSS specification, for example `rgb(0 255 0)`
- Less dependencies: _badge-maker_ no longer depends on _camelcase_

## 3.2.0

- Accessibility improvements: Help users of assistive technologies to read the badges when used inline

## 3.1.0

- Add TypeScript definitions

## 3.0.1

- Fix missing dependency

## 3.0.0

### Breaking Changes

- Dropped support for node < 10
- Package name has changed to `badge-maker` and moved to https://www.npmjs.com/package/badge-maker
- `BadgeFactory` class is removed and replaced by `makeBadge()` function.
- Deprecated parameters have been removed. In version 2.2.0 the `colorA`, `colorB` and `colorscheme` params were deprecated. In version 3.0.0 these have been removed.
- Only SVG output format is now provided. JSON format has been dropped and the `format` key has been removed.
- The `text` array has been replaced by `label` and `message` keys.
- The `template` key has been renamed `style`.
  To upgrade from v2.1.1, change your code from:
  ```js
  const { BadgeFactory } = require('gh-badges')
  const bf = new BadgeFactory()
  const svg = bf.create({
    text: ['build', 'passed'],
    format: 'svg',
    template: 'flat-square',
  })
  ```
  to:
  ```js
  const { makeBadge } = require('badge-maker')
  const svg = makeBadge({
    label: 'build',
    message: 'passed',
    style: 'flat-square',
  })
  ```
- `ValidationError` had been added and inputs are now validated. In previous releases, invalid inputs would be discarded and replaced with defaults. For example, in 2.2.1
  ```js
  const { BadgeFactory } = require('gh-badges')
  const bf = new BadgeFactory()
  const svg = bf.create({
    text: ['build', 'passed'],
    template: 'some invalid value',
  })
  ```
  would generate an SVG badge. In version >=3
  ```js
  const { makeBadge } = require('badge-maker')
  const svg = makeBadge({
    label: 'build',
    message: 'passed',
    style: 'some invalid value',
  })
  ```
  will throw a `ValidationError`.
- Raster support has been removed from the CLI. It will now only output SVG. On the console, the output of `badge` can be piped to a utility like [imagemagick](https://imagemagick.org/script/command-line-processing.php). If you were previously using
  ```sh
  badge build passed :green .gif
  ```
  this could be replaced by
  ```sh
  badge build passed :green | magick svg:- gif:-
  ```

### Security

- Removed dependency on doT library which has known vulnerabilities.

## 2.2.1 - 2019-05-30

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
