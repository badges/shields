Format
------

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

- [colorscheme.json](lib/colorscheme.json) for the `colorscheme` option
- [templates/](templates) for the `template` option


Defaults
--------

If you want to add a colorscheme, head to `lib/colorscheme.json`. Each scheme
has a name and a [CSS/SVG color][] for the color used in the first box (for the
first piece of text, field `colorA`) and for the one used in the second box
(field `colorB`).

[CSS/SVG color]: http://www.w3.org/TR/SVG/types.html#DataTypeColor

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
