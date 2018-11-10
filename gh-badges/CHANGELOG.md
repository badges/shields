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
