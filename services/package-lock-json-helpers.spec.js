'use strict'

const { getLockDependencyVersion } = require('./package-lock-json-helpers')
const { test, given } = require('sazerac')

describe('Contributor count helpers', function() {
  test(getLockDependencyVersion, () => {
    given({
      wantedDependency: 'left-pad',
      dependencies: { 'left-pad': { version: '~1.2.3' } },
    }).expect({
      range: '~1.2.3',
    })
    given({
      wantedDependency: 'left-pad',
      dependencies: { 'right-pad': { version: '~1.2.3' } },
    }).expectError('Invalid Parameter')
  })
})
