import { expect } from 'chai'
import {
  globalQueryParams,
  flattenQueryParams,
  filterQueryParams,
} from './query-params.js'

describe('Query params', function () {
  describe('flattenQueryParams', function () {
    it('includes the service params and the global params, sorted', function () {
      const result = flattenQueryParams(['message'])
      expect(result).to.include('message')
      expect(result).to.include.members(Array.from(globalQueryParams))
      expect(result).to.deep.equal(Array.from(result).sort())
    })

    it('returns the global params when nothing is declared', function () {
      const expected = Array.from(globalQueryParams).sort()
      expect(flattenQueryParams()).to.deep.equal(expected)
      expect(flattenQueryParams(undefined)).to.deep.equal(expected)
    })
  })

  describe('filterQueryParams', function () {
    it('keeps the allowed keys and drops the rest', function () {
      const result = filterQueryParams({ label: 'x', notAThing: 'y' }, [
        'label',
        'style',
      ])
      expect(result).to.deep.equal({ label: 'x', style: undefined })
      expect(result).to.have.own.property('style')
      expect(result).to.not.have.property('notAThing')
    })
  })
})
