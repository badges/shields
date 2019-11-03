'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const { optionalUrl } = require('../validators')
const {
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
} = require('./packagist-base')
const { NotFound } = require('..')

const packageSchema = Joi.object()
  .pattern(
    /^/,
    Joi.object({
      license: Joi.array().required(),
    }).required()
  )
  .required()

const schema = Joi.object({
  packages: Joi.object()
    .pattern(/^/, packageSchema)
    .required(),
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
        documentation: customServerDocumentationFragment,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'license',
    }
  }

  transform({ json, user, repo }) {
    const packageName = this.getPackageName(user, repo)
    const branch = json.packages[packageName]['dev-master']
    if (!branch) {
      throw new NotFound({ prettyMessage: 'default branch not found' })
    }
    const { license } = branch
    return { license }
  }

  async handle({ user, repo }, { server }) {
    const json = await this.fetch({ user, repo, schema, server })
    const { license } = this.transform({ json, user, repo })
    return renderLicenseBadge({ license })
  }
}
