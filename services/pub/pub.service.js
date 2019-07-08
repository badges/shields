'use strict'

const Joi = require('@hapi/joi')
const { latest, renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  versions: Joi.array()
    .items(Joi.string())
    .required(),
}).required()

module.exports = class PubVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'pub',
      pattern: ':variant(v|vpre)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Pub',
        pattern: 'v/:packageName',
        namedParams: { packageName: 'box2d' },
        staticPreview: renderVersionBadge({ version: 'v0.4.0' }),
        keywords: ['dart', 'dartlang'],
      },
      {
        title: 'Pub',
        pattern: 'vpre/:packageName',
        namedParams: { packageName: 'box2d' },
        staticPreview: renderVersionBadge({ version: 'v0.4.0' }),
        keywords: ['dart', 'dartlang'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'pub' }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dartlang.org/packages/${packageName}.json`,
    })
  }

  async handle({ variant, packageName }) {
    const data = await this.fetch({ packageName })
    const includePre = variant === 'vpre'
    const versions = data.versions
    const version = latest(versions, { pre: includePre })
    return renderVersionBadge({ version })
  }
}
