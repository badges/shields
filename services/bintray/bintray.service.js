'use strict'

const Joi = require('joi')
const { optionalAuth } = require('../auth')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object()
  .keys({
    name: Joi.string().required(),
  })
  .required()

module.exports = class Bintray extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'bintray/v',
      pattern: ':subject/:repo/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bintray',
        staticPreview: renderVersionBadge({ version: '1.6.0' }),
        namedParams: {
          subject: 'asciidoctor',
          repo: 'maven',
          packageName: 'asciidoctorj',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'bintray' }
  }

  async fetch({ subject, repo, packageName }) {
    // https://bintray.com/docs/api/#_get_version
    return this._requestJson({
      schema,
      url: `https://bintray.com/api/v1/packages/${subject}/${repo}/${packageName}/versions/_latest`,
      options: {
        auth: optionalAuth(this, {
          userKey: 'bintray_user',
          passKey: 'bintray_apikey',
        }),
      },
    })
  }

  async handle({ subject, repo, packageName }) {
    const data = await this.fetch({ subject, repo, packageName })
    return renderVersionBadge({ version: data.name })
  }
}
