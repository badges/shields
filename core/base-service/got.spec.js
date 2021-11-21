import { expect } from 'chai'
import nock from 'nock'
import { _fetchFactory } from './got.js'
import { Inaccessible, InvalidResponse } from './errors.js'

describe('got wrapper', function () {
  it('should not throw an error if the response <= fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(100))
    const sendRequest = _fetchFactory(100)
    const { res } = await sendRequest('https://www.google.com/foo/bar')
    expect(res.statusCode).to.equal(200)
  })

  it('should throw an InvalidResponse error if the response is > fetchLimitBytes', async function () {
    nock('https://www.google.com')
      .get('/foo/bar')
      .once()
      .reply(200, 'x'.repeat(101))
    const sendRequest = _fetchFactory(100)
    return expect(
      sendRequest('https://www.google.com/foo/bar')
    ).to.be.rejectedWith(InvalidResponse, 'Maximum response size exceeded')
  })

  it('should throw an Inaccessible error if the request throws a (non-HTTP) error', async function () {
    nock('https://www.google.com').get('/foo/bar').replyWithError('oh no')
    const sendRequest = _fetchFactory(1024)
    return expect(
      sendRequest('https://www.google.com/foo/bar')
    ).to.be.rejectedWith(Inaccessible, 'oh no')
  })

  it('should throw an Inaccessible error if the host can not be accessed', async function () {
    this.timeout(5000)
    nock.disableNetConnect()
    const sendRequest = _fetchFactory(1024)
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

  afterEach(function () {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
