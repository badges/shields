import Joi from 'joi'
import {
  minorVersion,
  versionReduction,
  getPhpReleases,
} from '../php-version.js'
import { BaseJsonService } from '../index.js'

const optionalNumberOrString = Joi.alternatives(Joi.string(), Joi.number())
const schema = Joi.object({
  branch: Joi.object({
    config: Joi.object({
      php: Joi.array().items(optionalNumberOrString),
      matrix: Joi.object({
        include: Joi.array().items(Joi.object({ php: optionalNumberOrString })),
      }),
      jobs: Joi.object({
        include: Joi.array().items(Joi.object({ php: optionalNumberOrString })),
      }),
    }).required(),
  }).required(),
}).required()

export default class TravisPhpVersion extends BaseJsonService {
  static category = 'platform-support'

  static route = {
    base: 'travis/php-v',
    pattern: ':user/:repo/:branch+',
  }

  static examples = [
    {
      title: 'PHP version from Travis config',
      namedParams: { user: 'yiisoft', repo: 'yii', branch: 'master' },
      staticPreview: this.render({ reduction: ['5.3 - 7.4'] }),
    },
  ]

  static defaultBadgeData = {
    label: 'php',
  }

  static render({ reduction, hasHhvm }) {
    return {
      message: reduction.concat(hasHhvm ? ['HHVM'] : []).join(', '),
      color: 'blue',
    }
  }

  constructor(context, config) {
    super(context, config)
    this._githubApiProvider = context.githubApiProvider
  }

  async transform({ branch: { config } }) {
    let travisVersions = []

    // from php
    if (config.php) {
      travisVersions = travisVersions.concat(config.php.map(v => v.toString()))
    }
    // from matrix
    if (config.matrix && config.matrix.include) {
      travisVersions = travisVersions.concat(
        config.matrix.include.filter(v => 'php' in v).map(v => v.php.toString())
      )
    }
    // from jobs
    if (config.jobs && config.jobs.include) {
      travisVersions = travisVersions.concat(
        config.jobs.include.filter(v => 'php' in v).map(v => v.php.toString())
      )
    }

    const versions = travisVersions
      .map(v => minorVersion(v))
      .filter(v => v.includes('.'))

    return {
      reduction: versionReduction(
        versions,
        await getPhpReleases(this._githubApiProvider)
      ),
      hasHhvm: travisVersions.find(v => v.startsWith('hhvm')),
    }
  }

  async handle({ user, repo, branch }) {
    const travisConfig = await this._requestJson({
      schema,
      url: `https://api.travis-ci.org/repos/${user}/${repo}/branches/${branch}`,
      errorMessages: {
        404: 'repo not found',
      },
    })
    const { reduction, hasHhvm } = await this.transform(travisConfig)
    return this.constructor.render({ reduction, hasHhvm })
  }
}
