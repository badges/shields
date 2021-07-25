import { expect } from 'chai'
import { NotFound } from '../index.js'
import { SymfonyInsightBase } from './symfony-insight-base.js'

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
