import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, pathParams } from '../index.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

export class TravisComBuild extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'travis',
    format: 'com/(?!php-v)([^/]+/[^/]+?)(?:/(.+?))?',
    capture: ['userRepo', 'branch'],
  }

  static openApi = {
    '/travis/com/{user}/{repo}': {
      get: {
        summary: 'Travis (.com)',
        parameters: pathParams(
          {
            name: 'user',
            example: 'ivandelabeldad',
          },
          {
            name: 'repo',
            example: 'rackian-gateway',
          },
        ),
      },
    },
    '/travis/com/{user}/{repo}/{branch}': {
      get: {
        summary: 'Travis (.com) branch',
        parameters: pathParams(
          {
            name: 'user',
            example: 'ivandelabeldad',
          },
          {
            name: 'repo',
            example: 'rackian-gateway',
          },
          {
            name: 'branch',
            example: 'master',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'build',
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle({ userRepo, branch }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://api.travis-ci.com/${userRepo}.svg`,
      options: { searchParams: { branch } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render({ status })
  }
}
