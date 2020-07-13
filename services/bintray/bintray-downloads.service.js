'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  totalDownloads: Joi.number().required(),
}).required()

const versionSchema = Joi.object({
  name: Joi.string().required(),
}).required()

module.exports = class BintrayDownloads extends BaseJsonService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'bintray/d',
      pattern: ':subject/:repo/:packageName/:version*',
    }
  }

  static get auth() {
    return {
      userKey: 'bintray_user',
      passKey: 'bintray_apikey',
      authorizedOrigins: ['https://bintray.com'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Bintray',
        staticPreview: this.render({ downloads: 69000 }),
        namedParams: {
          subject: 'asciidoctor',
          repo: 'maven',
          packageName: 'asciidoctorj',
        },
      },
      {
        title: 'Bintray (latest)',
        staticPreview: this.render({ version: 'latest', downloads: 69000 }),
        namedParams: {
          subject: 'asciidoctor',
          repo: 'maven',
          packageName: 'asciidoctorj',
          version: 'latest',
        },
      },
      {
        title: 'Bintray (version)',
        staticPreview: this.render({ version: '1.6.0', downloads: 69000 }),
        namedParams: {
          subject: 'asciidoctor',
          repo: 'maven',
          packageName: 'asciidoctorj',
          version: '1.6.0',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ version, downloads }) {
    return {
      label: version ? `downloads@${version}` : 'downloads',
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async fetch({ subject, repo, packageName, version }) {
    return this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url: version
          ? `https://bintray.com/api/ui/version/${subject}/${repo}/${packageName}/${version}/total_downloads`
          : `https://bintray.com/api/ui/package/${subject}/${repo}/${packageName}/total_downloads`,
      })
    )
  }

  async handle({ version, subject, repo, packageName }) {
    let actualVersion = version
    if (version === 'latest') {
      actualVersion = (
        await this._requestJson(
          this.authHelper.withBasicAuth({
            schema: versionSchema,
            url: `https://bintray.com/api/v1/packages/${subject}/${repo}/${packageName}/versions/_latest`,
          })
        )
      ).name
    }
    const { totalDownloads } = await this.fetch({
      subject,
      repo,
      packageName,
      version: actualVersion,
    })
    return this.constructor.render({ version, downloads: totalDownloads })
  }
}
