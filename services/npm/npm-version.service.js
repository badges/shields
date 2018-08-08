'use strict'

const Joi = require('joi')
const { addv } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { NotFound } = require('../errors')
const NpmBase = require('./npm-base')

// Joi.string should be a semver.
const schema = Joi.object()
  .pattern(/./, Joi.string())
  .required()

module.exports = class NpmVersion extends NpmBase {
  static get category() {
    return 'version'
  }

  static get url() {
    return this.buildUrl('npm/v', { withTag: true })
  }

  static get defaultBadgeData() {
    return { label: 'npm' }
  }

  static get examples() {
    return [
      {
        previewUrl: 'npm',
        keywords: ['node'],
      },
      {
        title: 'npm (scoped)',
        previewUrl: '@cycle/core',
        keywords: ['node'],
      },
      {
        title: 'npm (tag)',
        previewUrl: 'npm/next',
        keywords: ['node'],
      },
      {
        title: 'npm (custom registry)',
        previewUrl: 'npm/next',
        query: { registry_uri: 'https://registry.npmjs.com' },
        keywords: ['node'],
      },
      {
        title: 'npm (scoped with tag)',
        previewUrl: '@cycle/core/canary',
        keywords: ['node'],
      },
    ]
  }

  static render({ tag, version }) {
    return {
      label: tag ? `npm@${tag}` : undefined,
      message: addv(version),
      color: versionColor(version),
    }
  }

  async handle(namedParams, queryParams) {
    const {
      scope,
      packageName,
      tag,
      registryUrl,
    } = this.constructor.unpackParams(namedParams, queryParams)

    const slug =
      scope === undefined
        ? packageName
        : this.constructor.encodeScopedPackage({ scope, packageName })

    const packageData = await this._requestJson({
      schema,
      url: `${registryUrl}/-/package/${slug}/dist-tags`,
      notFoundMessage: 'package not found',
    })

    if (tag && !(tag in packageData)) {
      throw new NotFound({ prettyMessage: 'tag not found' })
    }

    return this.constructor.render({
      tag,
      version: packageData[tag || 'latest'],
    })
  }
}
