# GitHub badges in SVG format

See <https://github.com/h5bp/lazyweb-requests/issues/150>.

# Contribute

If you want to add a badge, only modify `badges.json`.

The format is the following:

```js
/* Unique name of your badge. */
"build-passed": {
  /* Textual information shown, in order. */
  "text": [ "build", "passed" ],
  "colorscheme": "green"
}
```

Color schemes are located at the bottom of the file. Each scheme has a name and
a series of color stops used to compute the gradient of the background color of
the boxes.

```js
"green": {
  /* Gradient of the background color of the second box.
     The main gradient is from index 1 to 2,
     indices 0 and 3 provide the light and dark outline. */
  "colorB": [ "#8f6", "#4c1", "#3b0", "#370" ]
}
```

Usually, the first box uses the same dark grey. Rely on this default by not
providing a `"colorA"` field (such as above). Otherwise, the `"colorA"` field
works exactly the same way.

You can also use the `"colorA"` and `"colorB"` fields directly in the badges if
you don't want to make a color scheme for it. In that case, remove the
`"colorscheme"` field altogether.

# License

All work here is licensed CC0.
