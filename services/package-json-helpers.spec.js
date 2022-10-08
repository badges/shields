import { test, given } from 'sazerac'
import { getDependencyVersion } from './package-json-helpers.js'

describe('Package json helpers', function () {
  test(getDependencyVersion, () => {
    given({
      wantedDependency: 'left-pad',
      dependencies: { 'left-pad': '~1.2.3' },
      devDependencies: {},
      peerDependencies: {},
    }).expect('~1.2.3')

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
    }).expect('~1.2.3')

    given({
      kind: 'peer',
      wantedDependency: 'left-pad',
      dependencies: {},
      devDependencies: {},
      peerDependencies: { 'left-pad': '~1.2.3' },
    }).expect('~1.2.3')

    given({
      kind: 'notreal',
      wantedDependency: 'left-pad',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
    }).expectError('Not very kind: notreal')
  })
})
