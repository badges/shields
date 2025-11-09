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

  it('returns downloads badge and supports ETag conditional GET (200 then 304)', async function () {
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

    // second request: upstream responds 304 Not Modified when If-None-Match is provided
    const scope2 = nock(base)
      .get('/nodes/comfyui-image-captioner')
      .matchHeader('If-None-Match', '"abc123"')
      .reply(304)

    const result2 = await ComfyuiDownloads.invoke(
      defaultContext,
      {},
      {
        node: 'comfyui-image-captioner',
      },
    )

    expect(result2).to.not.have.property('isError')
    expect(result2).to.have.property('label', 'downloads')

    scope2.done()
  })

  it('falls back to a short TTL when max-age=0 and no ETag is provided', async function () {
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

    // second request: we do NOT expect a network call within the fallback TTL.
    // Arrange a nock that would return 500 if the service attempted a network
    // call — the test will fail in that case. If the cached value is used,
    // this nock will remain unused and the call will succeed.
    nock(base).get('/nodes/comfyui-image-captioner').reply(500)

    const result2 = await ComfyuiDownloads.invoke(
      defaultContext,
      {},
      {
        node: 'comfyui-image-captioner',
      },
    )

    expect(result2).to.not.have.property('isError')
    expect(result2).to.have.property('label', 'downloads')

    // Do not call scope2.done() — if the service made a network call the test
    // would have thrown due to the 500 reply above.
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
