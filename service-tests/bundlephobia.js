'use strict'

const Joi = require('joi')
const ServiceTester = require('./runner/service-tester')
const { isFileSize } = require('./helpers/validators')

const t = new ServiceTester({
  id: 'bundlephobia', title: 'NPM package bundle size',
})

const formats = {
  A: '/bundlephobia/:type/:package.:format',
  B: '/bundlephobia/:type/:package/:version.:format',
  C: '/bundlephobia/:type/@:scope/:package.:format',
  D: '/bundlephobia/:type/@:scope/:package/:version.:format',
}

const withoutErrorsMin = {
  A: '/min/preact.json',
  B: '/min/preact/8.2.7.json',
  C: '/min/@cycle/core.json',
  D: '/min/@cycle/core/7.0.0.json',
}

const withoutErrorsGzip = {
  A: '/gzip/preact.json',
  B: '/gzip/preact/8.2.7.json',
  C: '/gzip/@cycle/core.json',
  D: '/gzip/@cycle/core/7.0.0.json',
}

const withoutErrorSizesMin = {
  A: isFileSize,
  B: '8.94 kB',
  C: isFileSize,
  D: '3.51 kB',
}

const withoutErrorSizesGzip = {
  A: isFileSize,
  B: '3.58 kB',
  C: isFileSize,
  D: '1.23 kB',
}

const noExistPackages = {
  A: '/min/some-no-exist.json',
  B: '/min/some-no-exist/1.0.0.json',
  C: '/min/@some-no-exist/some-no-exist.json',
}

Object.keys(formats).forEach(format => {
  const withoutErrorMin = withoutErrorsMin[format]
  const withoutErrorSizeMin = withoutErrorSizesMin[format]

  const withoutErrorGzip = withoutErrorsGzip[format]
  const withoutErrorSizeGzip = withoutErrorSizesGzip[format]

  const noExistPackage = noExistPackages[format]

  if (typeof withoutErrorMin === 'string') {
    t.create(`Format '${formats[format]}' to get the minified bundle size`)
      .get(withoutErrorMin)
      .expectJSONTypes(Joi.object().keys({ name: 'minified size', value: withoutErrorSizeMin }))
  }

  if (typeof withoutErrorGzip === 'string') {
    t.create(`Format '${formats[format]}' to get the gzipped bundle size`)
      .get(withoutErrorGzip)
      .expectJSONTypes(Joi.object().keys({ name: 'gzip size', value: withoutErrorSizeGzip }))
  }

  if (typeof noExistPackage === 'string') {
    t.create(`Format '${formats[format]}' where it doesn't exist`)
      .get(noExistPackage)
      .expectJSON({
        name: 'minified size',
        value: 'package not found error',
      })
  }
})

module.exports = t
