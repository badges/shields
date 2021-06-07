'use strict'

const Joi = require('joi')
const { optionalUrl } = require('../validators')
const { renderVersionBadge } = require('../version')
const { BaseXmlService } = require('..')

const queryParamSchema = Joi.object({
  metadataUrl: optionalUrl.required(),
  latestOrRelease: Joi.string().valid('release', 'latest').optional(),
}).required()

const schema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      latest: Joi.string().required(),
      release: Joi.string().required(),
    }).required(),
  }).required(),
}).required()

module.exports = class MavenMetadata extends BaseXmlService {
  static category = 'version'

  static route = {
    base: 'maven-metadata',
    pattern: 'v',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Maven metadata URL',
      namedParams: {},
      queryParams: {
        metadataUrl:
          'https://repo1.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml',
        latestOrRelease: 'latest',
      },
      staticPreview: renderVersionBadge({ version: '2.8.5' }),
    },
  ]

  static defaultBadgeData = {
    label: 'maven',
  }

  async fetch({ metadataUrl }) {
    return this._requestXml({
      schema,
      url: metadataUrl,
      parserOptions: { parseNodeValue: false },
    })
  }

  async handle(_namedParams, { metadataUrl, latestOrRelease }) {
    const data = await this.fetch({ metadataUrl })
    let v
    if (
      latestOrRelease === 'latest' ||
      typeof latestOrRelease === 'undefined'
    ) {
      v = data.metadata.versioning.latest
    } else if (latestOrRelease === 'release') {
      v = data.metadata.versioning.release
    }
    return renderVersionBadge({
      version: v,
    })
  }
}
