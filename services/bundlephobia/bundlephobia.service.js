'use strict'

const Joi = require('joi')
const prettyBytes = require('pretty-bytes')
const { BaseJsonService } = require('..')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  size: nonNegativeInteger,
  gzip: nonNegativeInteger,
}).required()

const keywords = ['node', 'bundlephobia']

module.exports = class Bundlephobia extends BaseJsonService {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'bundlephobia',
      pattern: ':format(min|minzip)/:scope(@[^/]+)?/:packageName/:version?',
    }
  }

  static get examples() {
    return [
      {
        title: 'npm bundle size',
        pattern: ':format(min|minzip)/:packageName',
        namedParams: {
          format: 'min',
          packageName: 'react',
        },
        staticPreview: this.render({ format: 'min', size: 6652 }),
        keywords,
      },
      {
        title: 'npm bundle size (scoped)',
        pattern: ':format(min|minzip)/:scope/:packageName',
        namedParams: {
          format: 'min',
          scope: '@cycle',
          packageName: 'core',
        },
        staticPreview: this.render({ format: 'min', size: 3562 }),
        keywords,
      },
      {
        title: 'npm bundle size (version)',
        pattern: ':format(min|minzip)/:packageName/:version',
        namedParams: {
          format: 'min',
          packageName: 'react',
          version: '15.0.0',
        },
        staticPreview: this.render({ format: 'min', size: 20535 }),
        keywords,
      },
      {
        title: 'npm bundle size (scoped version)',
        pattern: ':format(min|minzip)/:scope/:packageName/:version',
        namedParams: {
          format: 'min',
          scope: '@cycle',
          packageName: 'core',
          version: '7.0.0',
        },
        staticPreview: this.render({ format: 'min', size: 3562 }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'bundlephobia',
      color: 'informational',
    }
  }

  static render({ format, size }) {
    const label = format === 'min' ? 'minified size' : 'minzipped size'
    return {
      label,
      message: prettyBytes(size),
    }
  }

  async fetch({ scope, packageName, version }) {
    const packageQuery = `${scope ? `${scope}/` : ''}${packageName}${
      version ? `@${version}` : ''
    }`
    const options = { qs: { package: packageQuery } }
    return this._requestJson({
      schema,
      url: 'https://bundlephobia.com/api/size',
      options,
      errorMessages: {
        404: 'package or version not found',
      },
    })
  }

  async handle({ format, scope, packageName, version }) {
    const json = await this.fetch({ scope, packageName, version })
    const size = format === 'min' ? json.size : json.gzip
    return this.constructor.render({ format, size })
  }
}
