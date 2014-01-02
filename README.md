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
  /* Width of the first box, width of the second box. */
  "widths": [ 33, 44 ],
  /* Gradient of the background color of the second box.
   * The main gradient is from index 1 to 2,
   * indices 0 and 4 provide the light and dark outline. */
  "colorB": [ "#8f6", "#4c1", "#3b0", "#370" ]
}
```

# License

All work here is licensed CC0.
