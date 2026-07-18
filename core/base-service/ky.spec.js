import { Readable } from 'stream'
import { gzipSync } from 'zlib'
import { createServer } from 'node:http'
import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { _fetchFactory } from './ky.js'
import { Inaccessible, InvalidResponse } from './errors.js'

use(chaiAsPromised)

describe('ky wrapper', function () {
  it('should not throw an error if the response <= fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(100))
    const sendRequest = _fetchFactory(100)
    const { res } = await sendRequest('https://www.google.com/foo/bar')
    expect(res.statusCode).to.equal(200)
  })

  it('should not reject an empty HEAD response based on Content-Length', async function () {
    nock('https://www.google.com')
      .head('/foo/bar')
      .reply(200, undefined, { 'Content-Length': '101' })
    const sendRequest = _fetchFactory(100)

    const { res, buffer } = await sendRequest(
      'https://www.google.com/foo/bar',
      { method: 'HEAD' },
    )

    expect(res.statusCode).to.equal(200)
    expect(buffer).to.equal('')
  })

  it('should throw an InvalidResponse error if the response is > fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(101))
    const sendRequest = _fetchFactory(100)
    return expect(
      sendRequest('https://www.google.com/foo/bar'),
    ).to.be.rejectedWith(InvalidResponse, 'Maximum response size exceeded')
  })

  it('should apply the response limit to the decompressed body', async function () {
    const body = Array.from({ length: 100 }, (_, index) =>
      String.fromCharCode(33 + ((index * 31) % 94)),
    ).join('')
    const compressedBody = gzipSync(body)
    expect(compressedBody.byteLength).to.be.greaterThan(100)
    nock('https://www.google.com').get('/foo/bar').reply(200, compressedBody, {
      'Content-Encoding': 'gzip',
      'Content-Length': compressedBody.byteLength,
    })
    const sendRequest = _fetchFactory(100)

    const { buffer } = await sendRequest('https://www.google.com/foo/bar')

    expect(buffer).to.equal(body)
  })

  it('should report download progress from zero through completion', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .reply(200, () => Readable.from(['foo', 'bar']))
    const events = []
    const sendRequest = _fetchFactory(100)

    const { buffer } = await sendRequest('https://www.google.com/foo/bar', {
      onDownloadProgress(progress, chunk) {
        events.push({ progress, chunk })
      },
    })

    expect(buffer).to.equal('foobar')
    expect(events[0]).to.deep.equal({
      progress: { percent: 0, totalBytes: 0, transferredBytes: 0 },
      chunk: new Uint8Array(),
    })
    expect(events.at(-1).progress).to.deep.equal({
      percent: 1,
      totalBytes: 6,
      transferredBytes: 6,
    })
  })

  it('should throw an Inaccessible error if the request throws a (non-HTTP) error', async function () {
    nock('https://www.google.com').get('/foo/bar').replyWithError('oh no')
    const sendRequest = _fetchFactory(1024)
    return expect(
      sendRequest('https://www.google.com/foo/bar'),
    ).to.be.rejectedWith(Inaccessible, 'oh no')
  })

  it('should throw an Inaccessible error if the host can not be accessed', async function () {
    this.timeout(5000)
    nock.disableNetConnect()
    const sendRequest = _fetchFactory(1024)
    return expect(
      sendRequest('https://www.google.com/foo/bar'),
    ).to.be.rejectedWith(
      Inaccessible,
      'Nock: Disallowed net connect for "www.google.com:443/foo/bar"',
    )
  })

  it('should throw a custom error if provided', async function () {
    const sendRequest = _fetchFactory(1024)
    return (
      expect(
        sendRequest(
          'https://www.google.com/foo/bar',
          { timeout: 1 },
          {
            ETIMEDOUT: {
              prettyMessage: 'Oh no! A terrible thing has happened',
              cacheSeconds: 10,
            },
          },
        ),
      )
        .to.be.rejectedWith(
          Inaccessible,
          'Inaccessible: Request timed out after 1ms',
        )
        // eslint-disable-next-line promise/prefer-await-to-then
        .then(error => {
          expect(error).to.have.property(
            'prettyMessage',
            'Oh no! A terrible thing has happened',
          )
          expect(error).to.have.property('cacheSeconds', 10)
        })
    )
  })

  it('should pass a custom user agent header', async function () {
    nock('https://www.google.com', {
      reqheaders: {
        'user-agent': function (agent) {
          return agent.startsWith('shields (self-hosted)')
        },
      },
    })
      .get('/foo/bar')
      .once()
      .reply(200)
    const sendRequest = _fetchFactory(1024)
    await sendRequest('https://www.google.com/foo/bar')
  })

  it('should omit headers whose value is undefined', async function () {
    nock('https://www.google.com', {
      badheaders: ['x-omit'],
      reqheaders: { 'x-keep': 'yes' },
    })
      .get('/foo/bar')
      .reply(200)
    const sendRequest = _fetchFactory(1024)

    await sendRequest('https://www.google.com/foo/bar', {
      headers: { 'x-keep': 'yes', 'x-omit': undefined },
    })
  })

  it('should replace existing URL search params and serialize null as empty', async function () {
    nock('https://www.google.com').get('/foo/bar?new=&page=2').reply(200)
    const sendRequest = _fetchFactory(1024)

    await sendRequest('https://www.google.com/foo/bar?old=1', {
      searchParams: { new: null, omitted: undefined, page: 2 },
    })
  })

  it('should support basic auth credentials embedded in the URL', async function () {
    nock('https://www.google.com', {
      reqheaders: { authorization: 'Basic dXNlcjpwQHNzd29yZA==' },
    })
      .get('/foo/bar')
      .reply(200)
    const sendRequest = _fetchFactory(1024)

    const { res } = await sendRequest(
      'https://user:p%40ssword@www.google.com/foo/bar',
    )

    expect(res.requestUrl.username).to.equal('')
    expect(res.requestUrl.password).to.equal('')
  })

  it('should prefer an explicit authorization header over URL credentials', async function () {
    nock('https://www.google.com', {
      reqheaders: { authorization: 'Bearer explicit-token' },
    })
      .get('/foo/bar')
      .reply(200)
    const sendRequest = _fetchFactory(1024)

    await sendRequest('https://user:password@www.google.com/foo/bar', {
      headers: { Authorization: 'Bearer explicit-token' },
    })
  })

  it('should wrap malformed URL credentials in an Inaccessible error', async function () {
    const sendRequest = _fetchFactory(1024)

    await expect(
      sendRequest('https://user:%E0%A4%A@www.google.com/foo/bar'),
    ).to.be.rejectedWith(Inaccessible, 'URI malformed')
  })

  it('should support selecting an IP version for DNS lookup', async function () {
    const server = createServer((request, response) => response.end('ok'))
    const sendRequest = _fetchFactory(1024)
    const originalProxyNamespace =
      process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE
    process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE = `KY_DISPATCHER_TEST_${process.pid}_`
    nock.restore()

    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', resolve)
      })
      const { port } = server.address()

      const { buffer } = await sendRequest(`http://localhost:${port}`, {
        dnsLookupIpVersion: 4,
      })

      expect(buffer).to.equal('ok')
    } finally {
      server.closeAllConnections()
      if (server.listening) {
        await new Promise(resolve => server.close(resolve))
      }
      nock.activate()
      if (originalProxyNamespace === undefined) {
        delete process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE
      } else {
        process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE =
          originalProxyNamespace
      }
    }
  })

  it('should expose the final URL after redirects', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .reply(302, undefined, { Location: '/foo/baz' })
      .get('/foo/baz')
      .reply(200, 'redirected')
    const sendRequest = _fetchFactory(1024)

    const { res, buffer } = await sendRequest('https://www.google.com/foo/bar')

    expect(res.redirected).to.be.true
    expect(res.requestUrl.href).to.equal('https://www.google.com/foo/bar')
    expect(res.url).to.equal('https://www.google.com/foo/baz')
    expect(buffer).to.equal('redirected')
  })

  it('should always return HTTP error responses without retrying', async function () {
    nock('https://www.google.com').get('/foo/bar').once().reply(404, 'missing')
    const sendRequest = _fetchFactory(1024)

    const { res, buffer } = await sendRequest(
      'https://www.google.com/foo/bar',
      { retry: 3, throwHttpErrors: true },
    )

    expect(res.statusCode).to.equal(404)
    expect(buffer).to.equal('missing')
  })

  afterEach(function () {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
