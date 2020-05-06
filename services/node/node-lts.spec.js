'use strict'

const { test, given } = require('sazerac')
const NodeVersion = require('./node-lts.service')

describe('node-lts renderStaticPreview', function () {
  it('should have parity with render()', async function () {
    const nodeVersionRange = '>= 6.0.0'

    const expectedNoTag = await NodeVersion.renderStaticPreview({
      nodeVersionRange,
    })
    const expectedLatestTag = await NodeVersion.renderStaticPreview({
      nodeVersionRange,
      tag: 'latest',
    })

    test(NodeVersion.renderStaticPreview.bind(NodeVersion), () => {
      given({ nodeVersionRange }).expect(expectedNoTag)
      given({ nodeVersionRange, tag: 'latest' }).expect(expectedLatestTag)
    })
  })
})
