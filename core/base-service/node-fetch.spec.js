import { URLSearchParams } from 'url'
import { expect } from 'chai'
import nock from 'nock'
import { request2NodeFetch, sendRequest } from './node-fetch.js'
import { Inaccessible, InvalidResponse } from './errors.js'

describe('request2NodeFetch function', function () {
  it('translates simple options', function () {
    expect(
      request2NodeFetch({
        url: 'https://google.com/',
        options: {
          body: 'body',
          headers: 'headers',
          method: 'method',
          gzip: 'gzip',
        },
      })
    ).to.deep.equal({
      url: 'https://google.com/',
      options: {
        body: 'body',
        headers: 'headers',
        method: 'method',
        compress: 'gzip',
      },
    })
  })

  it('translates auth to header', function () {
    expect(
      request2NodeFetch({
        url: 'https://google.com/',
        options: { auth: { user: 'user', pass: 'pass' } },
      })
    ).to.deep.equal({
      url: 'https://google.com/',
      options: {
        headers: {
          Authorization: 'Basic dXNlcjpwYXNz',
        },
      },
    })
    expect(
      request2NodeFetch({
        url: 'https://google.com/',
        options: { auth: { user: 'user' } },
      })
    ).to.deep.equal({
      url: 'https://google.com/',
      options: {
        headers: {
          Authorization: 'Basic dXNlcjo=',
        },
      },
    })
    expect(
      request2NodeFetch({
        url: 'https://google.com/',
        options: { auth: { pass: 'pass' } },
      })
    ).to.deep.equal({
      url: 'https://google.com/',
      options: {
        headers: {
          Authorization: 'Basic OnBhc3M=',
        },
      },
    })
  })

  it('translates form to body', function () {
    expect(
      request2NodeFetch({
        url: 'https://google.com/',
        options: {
          form: { foo: 'bar', baz: 1 },
        },
      })
    ).to.deep.equal({
      url: 'https://google.com/',
      options: {
        body: new URLSearchParams({ foo: 'bar', baz: 1 }),
        headers: {},
      },
    })
  })

  it('appends qs to URL', function () {
    expect(
      request2NodeFetch({
        url: 'https://google.com/',
        options: {
          qs: { foo: 'bar', baz: 1 },
        },
      })
    ).to.deep.equal({
      url: 'https://google.com/?foo=bar&baz=1',
      options: {
        headers: {},
      },
    })
  })

  it('throws if unrecognised options are found', function () {
    expect(() =>
      request2NodeFetch({
        url: 'https://google.com/',
        options: { body: 'body', foobar: 'foobar' },
      })
    ).to.throw(Error, 'Found unrecognised options foobar')
  })

  it('throws if body and form are both specified', function () {
    expect(() =>
      request2NodeFetch({
        url: 'https://google.com/',
        options: { body: 'body', form: 'form' },
      })
    ).to.throw(Error, "Options 'form' and 'body' can not both be used")
  })
})

describe('sendRequest', function () {
  it('should not throw an error if the response <= fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(100))
    const { res } = await sendRequest(100, 'https://www.google.com/foo/bar')
    expect(res.statusCode).to.equal(200)
  })

  it('should throw an InvalidResponse error if the response is > fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(101))
    return expect(
      sendRequest(100, 'https://www.google.com/foo/bar')
    ).to.be.rejectedWith(InvalidResponse, 'Maximum response size exceeded')
  })

  it('should throw an Inaccessible error if the request throws a (non-HTTP) error', async function () {
    nock('https://www.google.com').get('/foo/bar').replyWithError('oh no')
    return expect(
      sendRequest(1024, 'https://www.google.com/foo/bar')
    ).to.be.rejectedWith(Inaccessible, 'oh no')
  })

  it('should throw an Inaccessible error if the host can not be accessed', async function () {
    this.timeout(5000)
    nock.disableNetConnect()
    return expect(
      sendRequest(1024, 'https://www.google.com/foo/bar')
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
    await sendRequest(1024, 'https://www.google.com/foo/bar')
  })

  afterEach(function () {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
