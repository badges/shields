'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  totalDownloads: Joi.number().required(),
}).required()

const versionSchema = Joi.object({
  name: Joi.string().required(),
}).required()

const documentation = `
<p>
  These badges utilize unofficial Bintray APIs to retrieve download data. <br />
  As such, they may be unstable or intermittently unavailable.
</p>`

module.exports = class BintrayDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'bintray',
    pattern: ':interval(dt)/:subject/:repo/:packageName/:version*',
  }

  static auth = {
    userKey: 'bintray_user',
    passKey: 'bintray_apikey',
    authorizedOrigins: ['https://bintray.com'],
  }

  static examples = [
    {
      title: 'Bintray',
      staticPreview: this.render({ downloads: 69000 }),
      namedParams: {
        interval: 'dt',
        subject: 'asciidoctor',
        repo: 'maven',
        packageName: 'asciidoctorj',
      },
      documentation,
    },
    {
      title: 'Bintray (latest)',
      staticPreview: this.render({ version: 'latest', downloads: 69000 }),
      namedParams: {
        interval: 'dt',
        subject: 'asciidoctor',
        repo: 'maven',
        packageName: 'asciidoctorj',
        version: 'latest',
      },
      documentation,
    },
    {
      title: 'Bintray (version)',
      staticPreview: this.render({ version: '1.6.0', downloads: 69000 }),
      namedParams: {
        interval: 'dt',
        subject: 'asciidoctor',
        repo: 'maven',
        packageName: 'asciidoctorj',
        version: '1.6.0',
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ version, downloads }) {
    return {
      label: version ? `downloads@${version}` : 'downloads',
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async fetch({ subject, repo, packageName, version }) {
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
    return this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url: actualVersion
          ? `https://bintray.com/api/ui/version/${subject}/${repo}/${packageName}/${actualVersion}/total_downloads`
          : `https://bintray.com/api/ui/package/${subject}/${repo}/${packageName}/total_downloads`,
      })
    )
  }

  async handle({ version, subject, repo, packageName }) {
    const { totalDownloads } = await this.fetch({
      subject,
      repo,
      packageName,
      version,
    })
    return this.constructor.render({ version, downloads: totalDownloads })
  }
}
