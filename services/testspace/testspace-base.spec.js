'use strict'

const { expect } = require('chai')
const { NotFound } = require('..')
const TestspaceBase = require('./testspace-base')

describe('TestspaceBase', function () {
  it('throws NotFound when response is missing space results', function () {
    expect(() => TestspaceBase.prototype.transformCaseCounts([]))
      .to.throw(NotFound)
      .with.property('prettyMessage', 'space not found or results purged')
  })
})
