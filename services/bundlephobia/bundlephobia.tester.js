'use strict'

const { isFileSize } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'bundlephobia',
  title: 'NPM package bundle size',
}))

const formats = {
  A: '/bundlephobia/:type/:package.:format',
  B: '/bundlephobia/:type/:package/:version.:format',
  C: '/bundlephobia/:type/@:scope/:package.:format',
  D: '/bundlephobia/:type/@:scope/:package/:version.:format',
}

const data = [
  {
    format: formats.A,
    get: '/min/preact.json',
    expect: { label: 'minified size', message: isFileSize },
  },
  {
    format: formats.B,
    get: '/min/preact/8.0.0.json',
    expect: { label: 'minified size', message: isFileSize },
  },
  {
    format: formats.C,
    get: '/min/@cycle/core.json',
    expect: { label: 'minified size', message: isFileSize },
  },
  {
    format: formats.D,
    get: '/min/@cycle/core/7.0.0.json',
    expect: { label: 'minified size', message: isFileSize },
  },
  {
    format: formats.A,
    get: '/minzip/preact.json',
    expect: { label: 'minzipped size', message: isFileSize },
  },
  {
    format: formats.B,
    get: '/minzip/preact/8.0.0.json',
    expect: { label: 'minzipped size', message: isFileSize },
  },
  {
    format: formats.C,
    get: '/minzip/@cycle/core.json',
    expect: { label: 'minzipped size', message: isFileSize },
  },
  {
    format: formats.D,
    get: '/minzip/@cycle/core/7.0.0.json',
    expect: { label: 'minzipped size', message: isFileSize },
  },
  {
    format: formats.A,
    get: '/min/some-no-exist.json',
    expect: { label: 'minified size', message: 'package not found error' },
  },
  {
    format: formats.C,
    get: '/min/@some-no-exist/some-no-exist.json',
    expect: { label: 'minified size', message: 'package not found error' },
  },
]

data.forEach(({ format, get, expect }) => {
  t.create(`Testing format '${format}' against '${get}'`)
    .get(get)
    .expectBadge(expect)
})
