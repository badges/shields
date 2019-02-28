'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { latest, renderVersionBadge } = require('../version')

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
      pattern: ':which(v|vpre)/:packageName',
    }
  }

  static get defaultBadgeData() {
    return { label: 'pub' }
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

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dartlang.org/packages/${packageName}.json`,
    })
  }

  async handle({ which, packageName }) {
    const data = await this.fetch({ packageName })
    const includePre = which === 'vpre'
    const versions = data.versions
    const version = latest(versions, { pre: includePre })
    return renderVersionBadge({ version })
  }
}
