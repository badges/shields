import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import {
  BaseSvgScrapingService,
  deprecatedService,
  pathParams,
} from '../index.js'

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

  static staticPreview = {
    message: 'passing',
    color: 'brightgreen',
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

export const TravisOrgBuild = deprecatedService({
  category: 'build',
  route: {
    base: 'travis',
    format: '(?!php-v)([^/]+/[^/]+?)(?:/(.+?))?',
    capture: ['userRepo', 'branch'],
  },
  label: 'build',
  dateAdded: new Date('2023-05-13'),
})
