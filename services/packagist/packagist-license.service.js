'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const { keywords, BasePackagistService } = require('./packagist-base')

const schema = Joi.object({
  package: Joi.object({
    versions: Joi.object({
      'dev-master': Joi.object({
        license: Joi.array().required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class PackagistLicense extends BasePackagistService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'packagist/l',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist',
        namedParams: { user: 'doctrine', repo: 'orm' },
        staticPreview: renderLicenseBadge({ license: 'MIT' }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'license',
    }
  }

  transform({ json }) {
    return { license: json.package.versions['dev-master'].license }
  }

  async handle({ user, repo }) {
    const json = await this.fetch({ user, repo, schema })
    const { license } = this.transform({ json })
    return renderLicenseBadge({ license })
  }
}
