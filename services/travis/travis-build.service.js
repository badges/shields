import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService } from '../index.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

export default class TravisBuild extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'travis',
    format: '(?:(com)/)?(?!php-v)([^/]+/[^/]+?)(?:/(.+?))?',
    capture: ['comDomain', 'userRepo', 'branch'],
  }

  static examples = [
    {
      title: 'Travis (.org)',
      pattern: ':user/:repo',
      namedParams: { user: 'rust-lang', repo: 'rust' },
      staticPreview: {
        message: 'passing',
        color: 'brightgreen',
      },
    },
    {
      title: 'Travis (.org) branch',
      pattern: ':user/:repo/:branch',
      namedParams: { user: 'rust-lang', repo: 'rust', branch: 'master' },
      staticPreview: {
        message: 'passing',
        color: 'brightgreen',
      },
    },
    {
      title: 'Travis (.com)',
      pattern: 'com/:user/:repo',
      namedParams: { user: 'ivandelabeldad', repo: 'rackian-gateway' },
      staticPreview: {
        message: 'passing',
        color: 'brightgreen',
      },
    },
    {
      title: 'Travis (.com) branch',
      pattern: 'com/:user/:repo/:branch',
      namedParams: {
        user: 'ivandelabeldad',
        repo: 'rackian-gateway',
        branch: 'master',
      },
      staticPreview: {
        message: 'passing',
        color: 'brightgreen',
      },
    },
  ]

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

  async handle({ comDomain, userRepo, branch }) {
    const domain = comDomain || 'org'
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://api.travis-ci.${domain}/${userRepo}.svg`,
      options: { searchParams: { branch } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render({ status })
  }
}
