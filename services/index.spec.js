'use strict'

const { expect } = require('chai')
const { loadServiceClasses, InvalidService } = require('./index')

describe('loadServiceClasses function', function() {
  it('throws if module exports empty', function() {
    expect(() =>
      loadServiceClasses(['../test-fixtures/empty-undefined.fixture.js'])
    ).to.throw(InvalidService)
    expect(() =>
      loadServiceClasses(['../test-fixtures/empty-array.fixture.js'])
    ).to.throw()
    expect(() =>
      loadServiceClasses(['../test-fixtures/empty-object.fixture.js'])
    ).to.throw(InvalidService)
    expect(() =>
      loadServiceClasses(['../test-fixtures/empty-no-export.fixture.js'])
    ).to.throw(InvalidService)
    expect(() =>
      loadServiceClasses([
        '../test-fixtures/valid-array.fixture.js',
        '../test-fixtures/valid-class.fixture.js',
        '../test-fixtures/empty-array.fixture.js',
      ])
    ).to.throw(InvalidService)
  })

  it('throws if module exports invalid', function() {
    expect(() =>
      loadServiceClasses(['../test-fixtures/invalid-no-base.fixture.js'])
    ).to.throw(InvalidService)
    expect(() =>
      loadServiceClasses(['../test-fixtures/invalid-wrong-base.fixture.js'])
    ).to.throw(InvalidService)
    expect(() =>
      loadServiceClasses(['../test-fixtures/invalid-mixed.fixture.js'])
    ).to.throw(InvalidService)
    expect(() =>
      loadServiceClasses([
        '../test-fixtures/valid-array.fixture.js',
        '../test-fixtures/valid-class.fixture.js',
        '../test-fixtures/invalid-no-base.fixture.js',
      ])
    ).to.throw(InvalidService)
  })

  it('registers services if module exports valid service classes', function() {
    expect(
      loadServiceClasses([
        '../test-fixtures/valid-array.fixture.js',
        '../test-fixtures/valid-object.fixture.js',
        '../test-fixtures/valid-class.fixture.js',
      ])
    ).to.have.length(5)
  })
})
