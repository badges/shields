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
  colorscheme: 'green',
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

  colorscheme: 'green',
  // or ...
  colorA: '#555',
  colorB: '#4c1',

  // See templates/ for a list of available templates.
  // Each offers a different visual design.
  template: 'flat',
}
```

### See also

* [colorscheme.json](./lib/colorscheme.json) for the `colorscheme` option
* [templates/](./templates) for the `template` option

## Defaults

If you want to use a colorscheme, head to `lib/colorscheme.json`. Each scheme
has a name and a [CSS/SVG color][] for the color used in the first box (for the
first piece of text, field `colorA`) and for the one used in the second box
(field `colorB`).

[css/svg color]: http://www.w3.org/TR/SVG/types.html#DataTypeColor

```js
"green": {
  "colorB": "#4c1"
}
```

Both `colorA` and `colorB` have default values. Usually, the first box uses the
same dark grey, so you can rely on that default value by not providing a
`"colorA"` field (such as above).

You can also use the `"colorA"` and `"colorB"` fields directly in the badges if
you don't want to make a color scheme for it. In that case, remove the
`"colorscheme"` field altogether.

## Text Width Computation

`BadgeFactory`'s constructor takes an optional boolean
`precomputeWidths` parameter which defaults to `false`.

Pre-computing the font width table adds some overhead to constructing the
`BadgeFactory` object (so will slow down generation of a single image),
but will speed up each badge generation if you are creating a lot of images.
As a rule of thumb:

If you are generating just one image, use:

```js
const bf = new BadgeFactory({ fontPath: '/path/to/Verdana.ttf' })
```

If you are generating many images with a single instance of `BadgeFactory`:

```js
const bf = new BadgeFactory({
  fontPath: '/path/to/Verdana.ttf',
  precomputeWidths: true,
})
```
