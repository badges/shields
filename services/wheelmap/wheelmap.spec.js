import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import Wheelmap from './wheelmap.service.js'

describe('Wheelmap', function () {
  cleanUpNockAfterEach()

  const token = 'abc123'
  const config = { private: { wheelmap_token: token } }

  function createMock({ nodeId, wheelchair }) {
    const scope = nock('https://wheelmap.org')
      .get(`/api/nodes/${nodeId}`)
      .query({ api_key: token })

    if (wheelchair) {
      return scope.reply(200, { node: { wheelchair } })
    } else {
      return scope.reply(404)
    }
  }

  it('node with accessibility', async function () {
    const nodeId = '26699541'
    const scope = createMock({ nodeId, wheelchair: 'yes' })
    expect(
      await Wheelmap.invoke(defaultContext, config, { nodeId })
    ).to.deep.equal({ message: 'yes', color: 'brightgreen' })
    scope.done()
  })

  it('node with limited accessibility', async function () {
    const nodeId = '2034868974'
    const scope = createMock({ nodeId, wheelchair: 'limited' })
    expect(
      await Wheelmap.invoke(defaultContext, config, { nodeId })
    ).to.deep.equal({ message: 'limited', color: 'yellow' })
    scope.done()
  })

  it('node without accessibility', async function () {
    const nodeId = '-147495158'
    const scope = createMock({ nodeId, wheelchair: 'no' })
    expect(
      await Wheelmap.invoke(defaultContext, config, { nodeId })
    ).to.deep.equal({ message: 'no', color: 'red' })
    scope.done()
  })

  it('node not found', async function () {
    const nodeId = '0'
    const scope = createMock({ nodeId })
    expect(
      await Wheelmap.invoke(defaultContext, config, { nodeId })
    ).to.deep.equal({ message: 'node not found', color: 'red', isError: true })
    scope.done()
  })
})
