'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../../lib/version')
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

  static get route() {
    return this.buildRoute('npm/v', { withTag: true })
  }

  static get defaultBadgeData() {
    return { label: 'npm' }
  }

  static get examples() {
    return [
      {
        title: 'npm',
        exampleUrl: 'npm',
        pattern: ':package',
        staticExample: this.render({ version: '6.3.0' }),
        keywords: ['node'],
      },
      {
        title: 'npm (scoped)',
        exampleUrl: '@cycle/core',
        pattern: ':scope/:package',
        staticExample: this.render({ version: '7.0.0' }),
        keywords: ['node'],
      },
      {
        title: 'npm (tag)',
        exampleUrl: 'npm/next',
        pattern: ':package/:tag',
        staticExample: this.render({ tag: 'latest', version: '6.3.0' }),
        keywords: ['node'],
      },
      {
        title: 'npm (custom registry)',
        exampleUrl: 'npm/next',
        pattern: ':package/:tag',
        staticExample: this.render({ tag: 'latest', version: '7.0.0' }),
        query: { registry_uri: 'https://registry.npmjs.com' },
        keywords: ['node'],
      },
      {
        title: 'npm (scoped with tag)',
        exampleUrl: '@cycle/core/canary',
        staticExample: this.render({ tag: 'latest', version: '6.3.0' }),
        pattern: ':scope/:package/:tag',
        keywords: ['node'],
      },
    ]
  }

  static render({ tag, version }) {
    const { label: defaultLabel } = this.defaultBadgeData
    return renderVersionBadge({
      tag,
      version,
      defaultLabel,
    })
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
      errorMessages: { 404: 'package not found' },
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
