'use strict'

const { test, given } = require('sazerac')
const NodeVersion = require('./node.service')

describe('renderStaticExample', function() {
  it('should have parity with render()', async function() {
    const nodeVersionRange = '>= 6.0.0'

    const expectedNoTag = await NodeVersion.renderStaticExample({
      nodeVersionRange,
    })
    const expectedLatestTag = await NodeVersion.renderStaticExample({
      nodeVersionRange,
      tag: 'latest',
    })

    test(NodeVersion.renderStaticExample, () => {
      given({ nodeVersionRange }).expect(expectedNoTag)
      given({ nodeVersionRange, tag: 'latest' }).expect(expectedLatestTag)
    })
  })
})
