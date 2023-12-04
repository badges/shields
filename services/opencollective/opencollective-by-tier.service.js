import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'
import { metric } from '../text-formatters.js'

const description = `<h3>How to get the tierId</h3>
<p>According to <a target="_blank" href="https://developer.opencollective.com/#/api/collectives?id=get-members-per-tier">open collectives documentation</a>, you can find the tierId by looking at the URL after clicking on a Tier Card on the collective page. (e.g. tierId for https://opencollective.com/shields/order/2988 is 2988)</p>`

// https://developer.opencollective.com/#/api/collectives?id=get-info
const collectiveDetailsSchema = Joi.object().keys({
  slug: Joi.string().required(),
  backersCount: nonNegativeInteger,
})

// https://developer.opencollective.com/#/api/collectives?id=get-members
function buildMembersArraySchema({ userType, tierRequired }) {
  const keys = {
    MemberId: Joi.number().required(),
    type: userType || Joi.string().required(),
    role: Joi.string().required(),
  }
  if (tierRequired) keys.tier = Joi.string().required()
  return Joi.array().items(Joi.object().keys(keys))
}

class OpencollectiveBaseJson extends BaseJsonService {
  static category = 'funding'

  static buildRoute(base, withTierId) {
    return {
      base: `opencollective${base ? `/${base}` : ''}`,
      pattern: `:collective${withTierId ? '/:tierId' : ''}`,
    }
  }

  static render(backersCount, label) {
    return {
      label,
      message: metric(backersCount),
      color: backersCount > 0 ? 'brightgreen' : 'lightgrey',
    }
  }

  async fetchCollectiveInfo(collective) {
    return this._requestJson({
      schema: collectiveDetailsSchema,
      // https://developer.opencollective.com/#/api/collectives?id=get-info
      url: `https://opencollective.com/${collective}.json`,
      httpErrors: {
        404: 'collective not found',
      },
    })
  }

  async fetchCollectiveBackersCount(collective, { userType, tierId }) {
    const schema = buildMembersArraySchema({
      userType:
        userType === 'users'
          ? 'USER'
          : userType === 'organizations'
            ? 'ORGANIZATION'
            : undefined,
      tierRequired: tierId,
    })
    const members = await this._requestJson({
      schema,
      // https://developer.opencollective.com/#/api/collectives?id=get-members
      // https://developer.opencollective.com/#/api/collectives?id=get-members-per-tier
      url: `https://opencollective.com/${collective}/members/${
        userType || 'all'
      }.json${tierId ? `?TierId=${tierId}` : ''}`,
      httpErrors: {
        404: 'collective not found',
      },
    })

    const result = {
      backersCount: members.filter(member => member.role === 'BACKER').length,
    }
    // Find the title of the tier
    if (tierId && members.length > 0)
      result.tier = members.map(member => member.tier)[0]
    return result
  }
}

// TODO: 1. pagination is needed. 2. use new graphql api instead of legacy rest api
export default class OpencollectiveByTier extends OpencollectiveBaseJson {
  static route = this.buildRoute('tier', true)

  static openApi = {
    '/opencollective/tier/{collective}/{tierId}': {
      get: {
        summary: 'Open Collective members by tier',
        description,
        parameters: pathParams(
          {
            name: 'collective',
            example: 'shields',
          },
          {
            name: 'tierId',
            example: '2988',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'open collective',
  }

  async handle({ collective, tierId }) {
    const result = await this.fetchCollectiveBackersCount(collective, {
      tierId,
    })
    if (result.tier) {
      if (!result.tier.endsWith('s')) result.tier += 's'
    } else result.tier = 'new tier'
    return this.constructor.render(result.backersCount, result.tier)
  }
}
