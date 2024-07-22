import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, InvalidResponse, pathParams } from '../index.js'

/**
 * Validates that the schema response is what we're expecting.
 * The username pattern should match the requirements in the freeCodeCamp
 * repository.
 *
 * @see https://github.com/freeCodeCamp/freeCodeCamp/blob/main/utils/validate.js
 */
const schema = Joi.object({
  entities: Joi.object({
    user: Joi.object()
      .required()
      .pattern(/^[a-zA-Z0-9\-_+]*$/, {
        points: Joi.number().allow(null).required(),
      }),
  }).required(),
}).required()

/**
 * This badge displays the total number of points a student has accumulated
 * from completing challenges on freeCodeCamp.
 */
export default class FreeCodeCampPoints extends BaseJsonService {
  static category = 'other'
  static route = {
    base: 'freecodecamp/points',
    pattern: ':username',
  }

  static openApi = {
    '/freecodecamp/points/{username}': {
      get: {
        summary: 'freeCodeCamp points',
        parameters: pathParams({
          name: 'username',
          example: 'raisedadead',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'points', color: 'info' }

  static render({ points }) {
    return { message: metric(points) }
  }

  async fetch({ username }) {
    return this._requestJson({
      schema,
      url: 'https://api.freecodecamp.org/api/users/get-public-profile',
      options: {
        searchParams: {
          username,
        },
      },
      httpErrors: { 404: 'profile not found' },
    })
  }

  static transform(response, username) {
    const { entities } = response

    const { points } = entities.user[username]

    if (points === null) {
      throw new InvalidResponse({ prettyMessage: 'private' })
    }

    return points
  }

  async handle({ username }) {
    const response = await this.fetch({ username })
    const points = this.constructor.transform(response, username)
    return this.constructor.render({ points })
  }
}
