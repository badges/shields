'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const { optionalUrl } = require('../validators')
const {
  keywords,
  BasePackagistService,
  documentation,
} = require('./packagist-base')

const schema = Joi.object({
  package: Joi.object({
    versions: Joi.object({
      'dev-master': Joi.object({
        license: Joi.array().required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

module.exports = class PackagistLicense extends BasePackagistService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'packagist/l',
      pattern: ':user/:repo',
      queryParamSchema,
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
      {
        title: 'Packagist (custom server)',
        namedParams: { user: 'doctrine', repo: 'orm' },
        queryParams: { server: 'https://packagist.org' },
        staticPreview: renderLicenseBadge({ license: 'MIT' }),
        keywords,
        documentation,
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

  async handle({ user, repo }, { server }) {
    const json = await this.fetch({ user, repo, schema, server })
    const { license } = this.transform({ json })
    return renderLicenseBadge({ license })
  }
}
