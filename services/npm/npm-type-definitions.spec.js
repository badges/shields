'use strict'

const { test, given, forCases } = require('sazerac')
const NpmTypeDefinitions = require('./npm-type-definitions.service')

describe('NPM type definitions badge', function() {
  test(NpmTypeDefinitions.transform, () => {
    forCases([
      given({ devDependencies: { typescript: '^2.4.7' }, files: [] }),
      given({ devDependencies: {}, types: 'types/index.d.ts', files: [] }),
      given({ devDependencies: {}, types: 'types/index.d.ts', files: [] }),
      given({ devDependencies: {}, typings: 'index.d.ts', files: [] }),
      given({ devDependencies: {}, files: ['index.js', 'index.d.ts'] }),
    ]).expect({ supportedLanguages: ['TypeScript'] })

    given({ devDependencies: { 'flow-bin': '1.2.3' }, files: [] }).expect({
      supportedLanguages: ['Flow'],
    })

    given({
      devDependencies: { 'flow-bin': '1.2.3', typescript: '^2.4.7' },
      files: [],
    }).expect({ supportedLanguages: ['TypeScript', 'Flow'] })

    given({ devDependencies: {}, files: [] }).expect({ supportedLanguages: [] })
    given({ devDependencies: {}, files: ['index.d.ts'] }).expect({
      supportedLanguages: ['TypeScript'],
    })
    given({ devDependencies: {}, files: ['index.js.flow'] }).expect({
      supportedLanguages: ['Flow'],
    })
  })
})
