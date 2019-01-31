'use strict'

const { expect } = require('chai')
const { validateExample } = require('./transform-example')

describe('validateExample function', function() {
  it('passes valid examples', function() {
    const validExamples = [
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
      },
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
      { staticPreview: { message: '123' } },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        namedParams: { package: 'mypackage' },
        exampleUrl: 'dt/mypackage',
      },
      { staticPreview: { message: '123' }, pattern: 'dt/:package' },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        previewUrl: 'dt/mypackage',
      },
      {
        staticPreview: { message: '123' },
        pattern: 'dt/:package',
        exampleUrl: 'dt/mypackage',
      },
      { previewUrl: 'dt/mypackage' },
    ]

    invalidExamples.forEach(example => {
      expect(() =>
        validateExample(example, 0, { route: {}, name: 'mockService' })
      ).to.throw(Error)
    })
  })
})
