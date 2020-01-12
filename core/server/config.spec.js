'use strict'

const { test, given } = require('sazerac')
const { merge } = require('./config')

describe('configuration', function() {
  test(merge, function() {
    given({ a: 2 }, {})
      .describe('copies the default value')
      .expect({ a: 2 })
    given({ a: 2 }, { a: 3 })
      .describe('overrides a primitive value')
      .expect({ a: 3 })
    given({ a: { a1: 1, a2: 2 } }, { a: { a1: 2 } })
      .describe('merges objects')
      .expect({ a: { a1: 2, a2: 2 } })
    given({ a: { a1: 1, a2: 2 } }, { a: 3 })
      .describe('overdrives an object with a primitive')
      .expect({ a: 3 })
    given({ a: { a1: 1, a2: 2 } }, { a: {} })
      .describe('does not override an object wit an empty object')
      .expect({ a: { a1: 1, a2: 2 } })
    given({ a: [2, 3, 4] }, { a: [5, 6] })
      .describe('overrides array')
      .expect({ a: [5, 6] })
  })
})
