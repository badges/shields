'use strict'

const { test, given } = require('sazerac')
const { getDependencyVersion } = require('./package-json-helpers')

describe('Contributor count helpers', function () {
  test(getDependencyVersion, () => {
    given({
      wantedDependency: 'left-pad',
      dependencies: { 'left-pad': '~1.2.3' },
      devDependencies: {},
      peerDependencies: {},
    }).expect({
      range: '~1.2.3',
    })
    given({
      kind: 'dev',
      wantedDependency: 'left-pad',
      dependencies: { 'left-pad': '~1.2.3' },
      devDependencies: {},
      peerDependencies: {},
    }).expectError('Invalid Parameter')
    given({
      kind: 'dev',
      wantedDependency: 'left-pad',
      dependencies: {},
      devDependencies: { 'left-pad': '~1.2.3' },
      peerDependencies: {},
    }).expect({
      range: '~1.2.3',
    })
    given({
      kind: 'peer',
      wantedDependency: 'left-pad',
      dependencies: {},
      devDependencies: {},
      peerDependencies: { 'left-pad': '~1.2.3' },
    }).expect({
      range: '~1.2.3',
    })
    given({
      kind: 'notreal',
      wantedDependency: 'left-pad',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
    }).expectError('Not very kind: notreal')
  })
})
