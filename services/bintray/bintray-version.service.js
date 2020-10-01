'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object()
  .keys({
    name: Joi.string().required(),
  })
  .required()

module.exports = class BintrayVersion extends BaseJsonService {
  static category = 'version'
  static route = { base: 'bintray/v', pattern: ':subject/:repo/:packageName' }

  static auth = {
    userKey: 'bintray_user',
    passKey: 'bintray_apikey',
    authorizedOrigins: ['https://bintray.com'],
  }

  static examples = [
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

  static defaultBadgeData = { label: 'bintray' }

  async fetch({ subject, repo, packageName }) {
    // https://bintray.com/docs/api/#_get_version
    return this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url: `https://bintray.com/api/v1/packages/${subject}/${repo}/${packageName}/versions/_latest`,
      })
    )
  }

  async handle({ subject, repo, packageName }) {
    const data = await this.fetch({ subject, repo, packageName })
    return renderVersionBadge({ version: data.name })
  }
}
