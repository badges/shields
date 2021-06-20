import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

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

export default class OpencollectiveBase extends BaseJsonService {
  static category = 'funding'

  static buildRoute(base, withTierId) {
    return {
      base: `opencollective${base ? `/${base}` : ''}`,
      pattern: `:collective${withTierId ? '/:tierId' : ''}`,
    }
  }

  static render(backersCount, label) {
    const badge = {
      message: backersCount,
      color: backersCount > 0 ? 'brightgreen' : 'lightgrey',
    }
    if (label) badge.label = label
    return badge
  }

  async fetchCollectiveInfo(collective) {
    return this._requestJson({
      schema: collectiveDetailsSchema,
      // https://developer.opencollective.com/#/api/collectives?id=get-info
      url: `https://opencollective.com/${collective}.json`,
      errorMessages: {
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
      errorMessages: {
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
