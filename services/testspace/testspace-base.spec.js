import { expect } from 'chai'
import { NotFound } from '../index.js'
import TestspaceBase from './testspace-base.js'

describe('TestspaceBase', function () {
  it('throws NotFound when response is missing space results', function () {
    expect(() => TestspaceBase.prototype.transformCaseCounts([]))
      .to.throw(NotFound)
      .with.property('prettyMessage', 'space not found or results purged')
  })
})
