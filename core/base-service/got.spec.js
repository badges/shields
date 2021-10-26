import { expect } from 'chai'
import nock from 'nock'
import { requestOptions2GotOptions, fetchFactory } from './got.js'
import { Inaccessible, InvalidResponse } from './errors.js'

describe('requestOptions2GotOptions function', function () {
  it('translates valid options', function () {
    expect(
      requestOptions2GotOptions({
        body: 'body',
        form: 'form',
        headers: 'headers',
        method: 'method',
        url: 'url',
        qs: 'qs',
        gzip: 'gzip',
        strictSSL: 'strictSSL',
        auth: { user: 'user', pass: 'pass' },
      })
    ).to.deep.equal({
      body: 'body',
      form: 'form',
      headers: 'headers',
      method: 'method',
      url: 'url',
      searchParams: 'qs',
      decompress: 'gzip',
      https: { rejectUnauthorized: 'strictSSL' },
      username: 'user',
      password: 'pass',
    })
  })

  it('throws if unrecognised options are found', function () {
    expect(() =>
      requestOptions2GotOptions({ body: 'body', foobar: 'foobar' })
    ).to.throw(Error, 'Found unrecognised options foobar')
  })
})

describe('got wrapper', function () {
  it('should not throw an error if the response <= fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(100))
    const sendRequest = fetchFactory(100)
    const { res } = await sendRequest('https://www.google.com/foo/bar')
    expect(res.statusCode).to.equal(200)
  })

  it('should throw an InvalidResponse error if the response is > fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(101))
    const sendRequest = fetchFactory(100)
    return expect(
      sendRequest('https://www.google.com/foo/bar')
    ).to.be.rejectedWith(InvalidResponse, 'Maximum response size exceeded')
  })

  it('should throw an Inaccessible error if the request throws a (non-HTTP) error', async function () {
    nock('https://www.google.com').get('/foo/bar').replyWithError('oh no')
    const sendRequest = fetchFactory(1024)
    return expect(
      sendRequest('https://www.google.com/foo/bar')
    ).to.be.rejectedWith(Inaccessible, 'oh no')
  })

  it('should throw an Inaccessible error if the host can not be accessed', async function () {
    this.timeout(5000)
    nock.disableNetConnect()
    const sendRequest = fetchFactory(1024)
    return expect(
      sendRequest('https://www.google.com/foo/bar')
    ).to.be.rejectedWith(
      Inaccessible,
      'Nock: Disallowed net connect for "www.google.com:443/foo/bar"'
    )
  })

  it('should pass a custom user agent header', async function () {
    nock('https://www.google.com', {
      reqheaders: {
        'user-agent': function (agent) {
          return agent.startsWith('Shields.io')
        },
      },
    })
      .get('/foo/bar')
      .once()
      .reply(200)
    const sendRequest = fetchFactory(1024)
    await sendRequest('https://www.google.com/foo/bar')
  })

  afterEach(function () {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
