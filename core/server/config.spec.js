'use strict'

const { expect } = require('chai')
const { merge } = require('./config')

describe('configuration', function() {
  describe('merge', function() {
    it('copies the default value', function() {
      const _default = { a: 2 }
      const custom = {}

      const merged = merge(_default, custom)
      expect(merged).to.deep.equal({ a: 2 })
    })

    it('overrides a primitive value', function() {
      const _default = { a: 2 }
      const custom = { a: 3 }

      const merged = merge(_default, custom)
      expect(merged).to.deep.equal({ a: 3 })
    })

    it('merges objects', function() {
      const _default = { a: { a1: 1, a2: 2 } }
      const custom = { a: { a1: 2 } }

      const merged = merge(_default, custom)
      expect(merged).to.deep.equal({ a: { a1: 2, a2: 2 } })
    })

    it('overdrives an object with a primitive', function() {
      const _default = { a: { a1: 1, a2: 2 } }
      const custom = { a: 3 }

      const merged = merge(_default, custom)
      expect(merged).to.deep.equal({ a: 3 })
    })

    it('does not override an object wit an empty object', function() {
      const _default = { a: { a1: 1, a2: 2 } }
      const custom = { a: {} }

      const merged = merge(_default, custom)
      expect(merged).to.deep.equal({ a: { a1: 1, a2: 2 } })
    })

    it('overrides array', function() {
      const _default = { a: [2, 3, 4] }
      const custom = { a: [5, 6] }

      const merged = merge(_default, custom)
      expect(merged).to.deep.equal({ a: [5, 6] })
    })
  })
})
