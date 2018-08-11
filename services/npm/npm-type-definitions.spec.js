'use strict'

const { test, given, forCases } = require('sazerac')
const NpmTypeDefinitions = require('./npm-type-definitions.service')

describe('NPM type definitions badge', function() {
  test(NpmTypeDefinitions.transform, () => {
    forCases([
      given({ devDependencies: { typescript: '^2.4.7' } }),
      given({ devDependencies: {}, types: 'types/index.d.ts' }),
      given({ devDependencies: {}, types: 'types/index.d.ts' }),
    ]).expect({ supportedLanguages: ['TypeScript'] })

    given({ devDependencies: { 'flow-bin': '1.2.3' } }).expect({
      supportedLanguages: ['Flow'],
    })

    given({
      devDependencies: { 'flow-bin': '1.2.3', typescript: '^2.4.7' },
    }).expect({ supportedLanguages: ['TypeScript', 'Flow'] })

    given({ devDependencies: {} }).expect({ supportedLanguages: [] })
  })
})
