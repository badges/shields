'use strict'

const { expect } = require('chai')
const validateExample = require('./validate-example')

describe('validateExample function', function() {
  it('passes valid examples', function() {
    const validExamples = [
      { staticExample: {}, pattern: 'dt/:package', exampleUrl: 'dt/mypackage' },
      {
        staticExample: {},
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
      },
      { previewUrl: 'dt/mypackage' },
    ]

    validExamples.forEach(example => {
      expect(() =>
        validateExample(example, 0, { route: {}, name: 'mockService' })
      ).not.to.throw(Error)
    })
  })

  it('rejects invalid examples', function() {
    const invalidExamples = [
      {},
      { staticExample: {} },
      {
        staticExample: {},
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
        exampleUrl: 'dt/mypackage',
      },
      { staticExample: {}, pattern: 'dt/:package' },
      { staticExample: {}, pattern: 'dt/:package', previewUrl: 'dt/mypackage' },
    ]

    invalidExamples.forEach(example => {
      expect(() =>
        validateExample(example, 0, { route: {}, name: 'mockService' })
      ).to.throw(Error)
    })
  })
})
