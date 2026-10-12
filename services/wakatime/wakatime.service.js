import Joi from 'joi'
import { BaseSvgScrapingService, pathParams } from '../index.js'

const schema = Joi.object({
  message: Joi.string().required(),
}).required()

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
        description: 'Total coding time tracked by WakaTime for a user.',
        parameters: pathParams({
          name: 'user',
          example: 'b9fcf8ba-3fce-41a4-a480-d3fe6074a1ad',
        }),
      },
    },
  }

  async handle({ user }) {
    const { message } = await this.fetchCodingTime(
      `https://wakatime.com/badge/user/${user}.svg`,
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
          'Coding time tracked by WakaTime for a user on a specific project.',
        parameters: pathParams(
          {
            name: 'user',
            example: 'b9fcf8ba-3fce-41a4-a480-d3fe6074a1ad',
          },
          {
            name: 'project',
            example: 'c9516ff1-10b9-41da-82fb-b86b24b0acc8',
          },
        ),
      },
    },
  }

  async handle({ user, project }) {
    const { message } = await this.fetchCodingTime(
      `https://wakatime.com/badge/user/${user}/project/${project}.svg`,
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
