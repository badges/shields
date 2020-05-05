'use strict'

const { expect } = require('chai')
const { NotFound } = require('..')
const { SymfonyInsightBase } = require('./symfony-insight-base')

describe('SymfonyInsightBase', function () {
  context('transform()', function () {
    it('throws NotFound error when there is no coverage data', function () {
      try {
        SymfonyInsightBase.prototype.transform({
          data: { project: {} },
        })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.prettyMessage).to.equal('no analyses found')
      }
    })
  })
})
