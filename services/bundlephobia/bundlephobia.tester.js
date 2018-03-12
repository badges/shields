'use strict'

const Joi = require('joi')
const ServiceTester = require('./runner/service-tester')
const { isFileSize } = require('./helpers/validators')

const t = new ServiceTester({
  id: 'bundlephobia', title: 'NPM package bundle size',
})

module.exports = t

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
    expect: { name: 'minified size', value: isFileSize },
  },
  {
    format: formats.B,
    get: '/min/preact/8.0.0.json',
    expect: { name: 'minified size', value: '7.94 kB' },
  },
  {
    format: formats.C,
    get: '/min/@cycle/core.json',
    expect: { name: 'minified size', value: isFileSize },
  },
  {
    format: formats.D,
    get: '/min/@cycle/core/7.0.0.json',
    expect: { name: 'minified size', value: '3.51 kB' },
  },
  {
    format: formats.A,
    get: '/minzip/preact.json',
    expect: { name: 'minzipped size', value: isFileSize },
  },
  {
    format: formats.B,
    get: '/minzip/preact/8.0.0.json',
    expect: { name: 'minzipped size', value: '3.35 kB' },
  },
  {
    format: formats.C,
    get: '/minzip/@cycle/core.json',
    expect: { name: 'minzipped size', value: isFileSize },
  },
  {
    format: formats.D,
    get: '/minzip/@cycle/core/7.0.0.json',
    expect: { name: 'minzipped size', value: '1.23 kB' },
  },
  {
    format: formats.A,
    get: '/min/some-no-exist.json',
    expect: { name: 'minified size', value: 'package not found error' },
  },
  {
    format: formats.C,
    get: '/min/@some-no-exist/some-no-exist.json',
    expect: { name: 'minified size', value: 'package not found error' },
  }
]

data.forEach( ({format, get, expect }) => {
  t.create(`Testing format '${format}' against '${get}'`)
    .get(get)
    .expectJSONTypes(Joi.object().keys(expect))
  }
)
