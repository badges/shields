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

2. A three- or six-character hex color, optionally prefixed with `#`:

- ![][4c1]
- ![][#007fff]
- etc.

3. [Any valid CSS color][css color], e.g.

- `rgb(...)`, `rgba(...)`
- `hsl(...)`, `hsla(...)`
- ![][aqua] ![][fuchsia] ![][lightslategray] etc.

[brightgreen]: https://img.shields.io/badge/brightgreen-brightgreen.svg
[green]: https://img.shields.io/badge/green-green.svg
[yellow]: https://img.shields.io/badge/yellow-yellow.svg
[yellowgreen]: https://img.shields.io/badge/yellowgreen-yellowgreen.svg
[orange]: https://img.shields.io/badge/orange-orange.svg
[red]: https://img.shields.io/badge/red-red.svg
[blue]: https://img.shields.io/badge/blue-blue.svg
[grey]: https://img.shields.io/badge/grey-grey.svg
[gray]: https://img.shields.io/badge/gray-gray.svg
[lightgrey]: https://img.shields.io/badge/lightgrey-lightgrey.svg
[lightgray]: https://img.shields.io/badge/lightgray-lightgray.svg
[4c1]: https://img.shields.io/badge/4c1-4c1.svg
[#007fff]: https://img.shields.io/badge/%23007fff-007fff.svg
[aqua]: https://img.shields.io/badge/aqua-aqua.svg
[fuchsia]: https://img.shields.io/badge/fuchsia-fuchsia.svg
[lightslategray]: https://img.shields.io/badge/lightslategray-lightslategray.svg
[css color]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
[css/svg color]: http://www.w3.org/TR/SVG/types.html#DataTypeColor
