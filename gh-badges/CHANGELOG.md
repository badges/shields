# Changelog

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

badge({ text: [ 'build', 'passed' ], colorscheme: 'green' },
  (svg, err) => {
    // svg is a string containing your badge
  })
```

With font path:

```js
const badge = require('gh-badges')

// Optional step, to have accurate text width computation.
badge.loadFont('/path/to/Verdana.ttf', err => {
  badge({ text: ['build', 'passed'], colorscheme: 'green', template: 'flat' },
    (svg, err) => {
      // svg is a string containing your badge
    })
})
```
