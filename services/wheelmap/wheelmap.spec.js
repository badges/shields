'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const Wheelmap = require('./wheelmap.service')

describe('Wheelmap', function() {
  cleanUpNockAfterEach()

  it('Sends auth headers to cloud instance', async function() {
    const token = 'abc123'

    const scope = nock('https://wheelmap.org')
      .get(/.*/)
      .query({ api_key: token })
      .reply(200, { node: { wheelchair: 'yes' } })

    expect(
      await Wheelmap.invoke(
        defaultContext,
        {
          private: { wheelmap_token: token },
        },
        { nodeId: '12345' }
      )
    ).to.deep.equal({
      message: 'yes',
      color: 'brightgreen',
    })

    scope.done()
  })
})
