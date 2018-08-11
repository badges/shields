'use strict'

const { test, given, forCases } = require('sazerac')
const NpmTypeDefinitions = require('./npm-type-definitions.service')

const transformAndRender = json =>
  NpmTypeDefinitions.render(NpmTypeDefinitions.transform(json))

describe.only('NPM type definitions badge', function() {
  test(transformAndRender, () => {
    forCases([
      given({ devDependencies: { typescript: '^2.4.7' } }),
      given({ devDependencies: {}, types: 'types/index.d.ts' }),
      given({ devDependencies: {}, types: 'types/index.d.ts' }),
    ]).expect({
      message: 'TypeScript',
      color: 'blue',
    })
    given({ devDependencies: { 'flow-bin': '1.2.3' } }).expect({
      message: 'Flow',
      color: 'blue',
    })
    given({
      devDependencies: { 'flow-bin': '1.2.3', typescript: '^2.4.7' },
    }).expect({
      message: 'TypeScript | Flow',
      color: 'blue',
    })
    given({ devDependencies: {} }).expect({
      message: 'none',
      color: 'lightgray',
    })
  })
})
