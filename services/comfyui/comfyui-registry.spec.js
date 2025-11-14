import { readFileSync } from 'fs'
import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import { ComfyuiDownloads } from './comfyui-registry.service.js'

const fixture = JSON.parse(
  readFileSync(
    new URL('./__fixtures__/comfyui_node.json', import.meta.url),
    'utf8',
  ),
)

describe('ComfyUI Registry', function () {
  cleanUpNockAfterEach()

  it('returns downloads badge when upstream responds 200', async function () {
    const base = 'https://api.comfy.org'
    // first response: 200 with ETag and Cache-Control: max-age=0, must-revalidate
    const scope1 = nock(base)
      .get('/nodes/comfyui-image-captioner')
      .reply(200, fixture, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        ETag: '"abc123"',
      })

    const result1 = await ComfyuiDownloads.invoke(
      defaultContext,
      {},
      {
        node: 'comfyui-image-captioner',
      },
    )

    expect(result1).to.not.have.property('isError')
    expect(result1).to.have.property('label', 'downloads')

    scope1.done()
  })

  it('returns downloads badge when max-age=0 and no ETag is provided', async function () {
    const base = 'https://api.comfy.org'
    // first response: 200 with Cache-Control: max-age=0, must-revalidate, but NO ETag
    const scope1 = nock(base)
      .get('/nodes/comfyui-image-captioner')
      .reply(200, fixture, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      })

    const result1 = await ComfyuiDownloads.invoke(
      defaultContext,
      {},
      {
        node: 'comfyui-image-captioner',
      },
    )

    expect(result1).to.not.have.property('isError')
    expect(result1).to.have.property('label', 'downloads')

    scope1.done()
  })

  it('maps 404 to not found', async function () {
    const base = 'https://api.comfy.org'
    const scope = nock(base).get('/nodes/nonexistent-node').reply(404)

    const res = await ComfyuiDownloads.invoke(
      defaultContext,
      {},
      {
        node: 'nonexistent-node',
      },
    )

    expect(res).to.have.property('isError', true)
    expect(res).to.have.property('message').that.is.a('string')

    scope.done()
  })
})
