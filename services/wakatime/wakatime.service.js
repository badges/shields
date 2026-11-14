import Joi from 'joi'
import { getCachedResource } from '../../core/base-service/resource-cache.js'
import { BaseSvgScrapingService, pathParams } from '../index.js'

const schema = Joi.object({
  message: Joi.string().required(),
}).required()

const userIdSchema = Joi.object({
  data: Joi.object({
    id: Joi.string().required(),
  }).required(),
}).required()

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// The WakaTime badge renders the value twice: once as a drop shadow and once
// as the visible text. The value is the last <text> element, immediately
// followed by an <a> element.
const valueMatcher = />([^<>]+)<\/text><a/

class WakaTimeBase extends BaseSvgScrapingService {
  static category = 'activity'

  static defaultBadgeData = {
    label: 'wakatime',
    color: 'blue',
  }

  static render({ message }) {
    return { message, color: 'blue' }
  }

  async fetchCodingTime(url) {
    return this._requestSvg({ schema, valueMatcher, url })
  }

  async resolveUserId(user) {
    // The badge endpoint only accepts the user's UUID, but the public API
    // accepts either a UUID or a username.
    if (uuidRegex.test(user)) {
      return user
    }

    // Cache the lookup so username badges don't add an upstream request on
    // every cache miss.
    const { data } = await getCachedResource({
      url: `https://wakatime.com/api/v1/users/${encodeURIComponent(user)}`,
      scraper: json => this.constructor._validate(json, userIdSchema),
    })
    return data.id
  }
}

class WakaTimeUser extends WakaTimeBase {
  static route = {
    base: 'wakatime/user',
    pattern: ':user',
  }

  static openApi = {
    '/wakatime/user/{user}': {
      get: {
        summary: 'WakaTime coding time',
        description:
          'Total coding time tracked by WakaTime for a user. The user can be the user id (UUID) included in the badge snippet on your WakaTime profile, or your public username.',
        parameters: pathParams({
          name: 'user',
          example: 'alan',
          description: 'WakaTime user id (UUID) or public username.',
        }),
      },
    },
  }

  async handle({ user }) {
    const userId = await this.resolveUserId(user)
    const { message } = await this.fetchCodingTime(
      `https://wakatime.com/badge/user/${userId}.svg`,
    )
    return this.constructor.render({ message })
  }
}

class WakaTimeUserProject extends WakaTimeBase {
  static route = {
    base: 'wakatime/user',
    pattern: ':user/project/:project',
  }

  static openApi = {
    '/wakatime/user/{user}/project/{project}': {
      get: {
        summary: 'WakaTime project coding time',
        description:
          'Coding time tracked by WakaTime for a user on a specific project. The user can be the user id (UUID) or public username. The project must be the project id (UUID) from the Project Badges page.',
        parameters: pathParams(
          {
            name: 'user',
            example: 'kirb',
            description: 'WakaTime user id (UUID) or public username.',
          },
          {
            name: 'project',
            example: 'c9516ff1-10b9-41da-82fb-b86b24b0acc8',
            description:
              'WakaTime project id (UUID) from the Project Badges page at https://wakatime.com/share.',
          },
        ),
      },
    },
  }

  async handle({ user, project }) {
    const userId = await this.resolveUserId(user)
    const { message } = await this.fetchCodingTime(
      `https://wakatime.com/badge/user/${userId}/project/${project}.svg`,
    )
    return this.constructor.render({ message })
  }
}

class WakaTimeRepo extends WakaTimeBase {
  static route = {
    base: 'wakatime/github',
    pattern: ':owner/:repo',
  }

  static openApi = {
    '/wakatime/github/{owner}/{repo}': {
      get: {
        summary: 'WakaTime repo coding time',
        description:
          'Coding time tracked by WakaTime for contributors to a GitHub repo.',
        parameters: pathParams(
          {
            name: 'owner',
            example: 'wakatime',
          },
          {
            name: 'repo',
            example: 'sublime-wakatime',
          },
        ),
      },
    },
  }

  async handle({ owner, repo }) {
    const { message } = await this.fetchCodingTime(
      `https://wakatime.com/badge/github/${owner}/${repo}.svg`,
    )
    return this.constructor.render({ message })
  }
}

export default [WakaTimeUser, WakaTimeUserProject, WakaTimeRepo]
