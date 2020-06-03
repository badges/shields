# badge-maker

[![npm version](https://img.shields.io/npm/v/badge-maker.svg)](https://npmjs.org/package/badge-maker)
[![npm license](https://img.shields.io/npm/l/badge-maker.svg)](https://npmjs.org/package/badge-maker)
[![npm type definitions](https://img.shields.io/npm/types/badge-maker)](https://npmjs.org/package/badge-maker)

## Installation

```sh
npm install badge-maker
```

## Usage

### On the console

```sh
npm install -g badge-maker
badge build passed :green > mybadge.svg
```

### As a library

With CommonJS in JavaScript,

```js
const { makeBadge, ValidationError } = require('badge-maker')
```

With ESM or TypeScript,

```ts
import { makeBadge, ValidationError } from 'badge-maker'
```

```js
const format = {
  label: 'build',
  message: 'passed',
  color: 'green',
}

const svg = makeBadge(format)
console.log(svg) // <svg...

try {
  makeBadge({})
} catch (e) {
  console.log(e) // ValidationError: Field `message` is required
}
```

### Node version support

The latest version of badge-maker supports all currently maintained Node
versions. See the [Node Release Schedule][].

[node release schedule]: https://github.com/nodejs/Release#release-schedule

## Format

The format is the following:

```js
{
  label: 'build',  // (Optional) Badge label
  message: 'passed',  // (Required) Badge message
  labelColor: '#555',  // (Optional) Label color
  color: '#4c1',  // (Optional) Message color

  // (Optional) One of: 'plastic', 'flat', 'flat-square', 'for-the-badge' or 'social'
  // Each offers a different visual design.
  style: 'flat',
}
```

## Colors

There are three ways to specify `color` and `labelColor`:

1. One of the [Shields named colors](./lib/color.js):

- ![][brightgreen]
- ![][green]
- ![][yellow]
- ![][yellowgreen]
- ![][orange]
- ![][red]
- ![][blue]
- ![][grey] ![][gray] – the default `labelColor`
- ![][lightgrey] ![][lightgray] – the default `color`

- ![][success]
- ![][important]
- ![][critical]
- ![][informational]
- ![][inactive] – the default `color`

2. A three- or six-character hex color, optionally prefixed with `#`:

- ![][9cf]
- ![][#007fff]
- etc.

3. [Any valid CSS color][css color], e.g.

- `rgb(...)`, `rgba(...)`
- `hsl(...)`, `hsla(...)`
- ![][aqua] ![][fuchsia] ![][lightslategray] etc.

[brightgreen]: https://img.shields.io/badge/brightgreen-brightgreen.svg
[success]: https://img.shields.io/badge/success-success.svg
[green]: https://img.shields.io/badge/green-green.svg
[yellow]: https://img.shields.io/badge/yellow-yellow.svg
[yellowgreen]: https://img.shields.io/badge/yellowgreen-yellowgreen.svg
[orange]: https://img.shields.io/badge/orange-orange.svg
[important]: https://img.shields.io/badge/important-important.svg
[red]: https://img.shields.io/badge/red-red.svg
[critical]: https://img.shields.io/badge/critical-critical.svg
[blue]: https://img.shields.io/badge/blue-blue.svg
[informational]: https://img.shields.io/badge/informational-informational.svg
[grey]: https://img.shields.io/badge/grey-grey.svg
[gray]: https://img.shields.io/badge/gray-gray.svg
[lightgrey]: https://img.shields.io/badge/lightgrey-lightgrey.svg
[lightgray]: https://img.shields.io/badge/lightgray-lightgray.svg
[inactive]: https://img.shields.io/badge/inactive-inactive.svg
[9cf]: https://img.shields.io/badge/9cf-9cf.svg
[#007fff]: https://img.shields.io/badge/%23007fff-007fff.svg
[aqua]: https://img.shields.io/badge/aqua-aqua.svg
[fuchsia]: https://img.shields.io/badge/fuchsia-fuchsia.svg
[lightslategray]: https://img.shields.io/badge/lightslategray-lightslategray.svg
[css color]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
[css/svg color]: http://www.w3.org/TR/SVG/types.html#DataTypeColor

## Raster Formats

Conversion to raster formats is no longer directly supported. In javascript
code, SVG badges can be converted to raster formats using a library like
[gm](https://www.npmjs.com/package/gm). On the console, the output of `badge`
can be piped to a utility like
[imagemagick](https://imagemagick.org/script/command-line-processing.php)
e.g: `badge build passed :green | magick svg:- gif:-`.
