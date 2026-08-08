import { expect } from 'chai'
import icedfrisbyNockModule from 'icedfrisby-nock'
import icedfrisbyModule from 'icedfrisby'
import nock from 'nock'
import icedfrisbyShieldsModule from './icedfrisby-shields.js'

const Frisby = icedfrisbyShieldsModule(icedfrisbyNockModule(icedfrisbyModule))

describe('icedfrisby-shields', function () {
  let nockWasActive

  beforeEach(function () {
    nockWasActive = nock.isActive()
    if (!nockWasActive) {
      nock.activate()
    }
  })

  afterEach(function () {
    nock.abortPendingRequests()
    nock.cleanAll()
    nock.enableNetConnect()
    if (nockWasActive && !nock.isActive()) {
      nock.activate()
    } else if (!nockWasActive && nock.isActive()) {
      nock.restore()
    }
  })

  async function runBeforeHooks(spec) {
    for (const hook of spec._hooks.before) {
      await hook()
    }
  }

  it('disables Nock for live tests', async function () {
    const spec = new Frisby('live test')

    await runBeforeHooks(spec)

    expect(nock.isActive()).to.be.false
  })

  it('reactivates Nock for intercepted tests', async function () {
    const spec = new Frisby('mocked test').intercept(nock =>
      nock('https://example.test').get('/').reply(200),
    )

    await runBeforeHooks(spec)

    expect(nock.isActive()).to.be.true
    expect(nock.pendingMocks()).to.deep.equal(['GET https://example.test:443/'])
  })
})
