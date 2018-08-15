'use strict'

const deprecatedService = require('../deprecated-service')
const PypiBase = require('./pypi-base')

// https://github.com/badges/shields/issues/716
module.exports = ['pypi/dm', 'pypi/dw', 'pypi/dd'].map(base =>
  deprecatedService({
    category: 'downloads',
    url: PypiBase.buildUrl(base),
    examples: [
      {
        title: 'downloads',
        previewUrl: 'Django',
        keywords: ['python'],
      },
    ],
  })
)
