# gh-badges

[![npm version](https://img.shields.io/npm/v/gh-badges.svg)](https://npmjs.org/package/gh-badges)
[![npm license](https://img.shields.io/npm/l/gh-badges.svg)](https://npmjs.org/package/gh-badges)

## Installation

```sh
npm install gh-badges
```

## Usage

### On the console

```sh
npm install -g gh-badges
badge build passed :green .png > mybadge.png
```

### As a library

```js
const { BadgeFactory } = require('gh-badges')

const bf = new BadgeFactory()

const format = {
  text: ['build', 'passed'],
  color: 'green',
  template: 'flat',
}

const svg = bf.create(format)
```

### Node version support

The latest version of gh-badges supports all currently maintained Node
versions. See the [Node Release Schedule][].

[node release schedule]: https://github.com/nodejs/Release#release-schedule

## Format

The format is the following:

```js
{
  text: [ 'build', 'passed' ],  // Textual information shown, in order

  format: 'svg',  // Also supports json

  color: '#4c1',
  labelColor: '#555',

  // See templates/ for a list of available templates.
  // Each offers a different visual design.
  template: 'flat',

  // Deprecated attributes:
  colorscheme: 'green', // Now an alias for `color`.
  colorB: '#4c1', // Now an alias for `color`.
  colorA: '#555', // Now an alias for `labelColor`.
}
```

### See also

- [templates/](./templates) for the `template` option

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
