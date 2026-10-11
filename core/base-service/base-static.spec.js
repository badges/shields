import { expect } from 'chai'
import sinon from 'sinon'
import Joi from 'joi'
import BaseStaticService from './base-static.js'
import '../register-chai-plugins.spec.js'

class DummyStaticService extends BaseStaticService {
  static category = 'other'
  static route = {
    base: 'dummy',
    pattern: ':which',
    queryParamSchema: Joi.object({ declared: Joi.string() }).required(),
  }

  static defaultBadgeData = { label: 'dummy' }

  async handle() {
    return { message: 'ok' }
  }
}

class UndeclaredStaticService extends BaseStaticService {
  static category = 'other'
  static route = { base: 'undeclared', pattern: ':which' }
  static defaultBadgeData = { label: 'undeclared' }

  async handle() {
    return { message: 'ok' }
  }
}

describe('BaseStaticService', function () {
  describe('register', function () {
    let mockCamp

    function invokeHandler(path, queryParams) {
      const [regex, handler] = mockCamp.route.getCall(0).args
      const match = path.match(regex)
      expect(match).to.not.be.null
      const ask = {
        req: { headers: {} },
        res: { statusCode: 200, setHeader() {}, end() {} },
      }
      return handler(queryParams, match, () => {}, ask)
    }

    beforeEach(function () {
      mockCamp = { route: sinon.spy() }
    })

    afterEach(function () {
      sinon.restore()
    })

    it('passes declared and global query params to the service, and nothing else', async function () {
      sinon.stub(DummyStaticService, 'invoke').resolves({ message: 'ok' })
      DummyStaticService.register(
        { camp: mockCamp, metricInstance: undefined },
        {},
      )

      await invokeHandler('/dummy/thing.json', {
        declared: 'yes',
        logoSize: 'auto',
        notAThing: 'nope',
      })

      const queryParams = DummyStaticService.invoke.getCall(0).args[3]
      expect(queryParams).to.have.property('declared', 'yes')
      expect(queryParams).to.have.property('logoSize', 'auto')
      expect(queryParams).to.not.have.property('notAThing')
    })

    it('passes global query params to a service with no query param schema', async function () {
      sinon.stub(UndeclaredStaticService, 'invoke').resolves({ message: 'ok' })
      UndeclaredStaticService.register(
        { camp: mockCamp, metricInstance: undefined },
        {},
      )

      await invokeHandler('/undeclared/thing.json', {
        label: 'yes',
        notAThing: 'nope',
      })

      const queryParams = UndeclaredStaticService.invoke.getCall(0).args[3]
      expect(queryParams).to.have.property('label', 'yes')
      expect(queryParams).to.not.have.property('notAThing')
    })
  })
})
