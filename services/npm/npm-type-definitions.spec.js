'use strict'

const { test, given } = require('sazerac')
const NpmTypeDefinitions = require('./npm-type-definitions.service')

const transformAndRender = json =>
  NpmTypeDefinitions.render(NpmTypeDefinitions.transform(json))

describe('NPM type definitions badge', function() {
  test(transformAndRender, () => {
    given({ devDependencies: { typescript: '^2.4.7' } }).expect({
      message: 'TypeScript v2.4',
      color: 'blue',
    })
  })
})
