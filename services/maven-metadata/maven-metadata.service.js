import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { renderVersionBadge } from '../version.js'
import { BaseXmlService, NotFound } from '../index.js'
import { documentation } from './maven-metadata.js'

const queryParamSchema = Joi.object({
  metadataUrl: optionalUrl.required(),
  versionPrefix: Joi.string().optional(),
  versionSuffix: Joi.string().optional(),
}).required()

const schema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      versions: Joi.object({
        version: Joi.array().items(Joi.string().required()).single().required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

export default class MavenMetadata extends BaseXmlService {
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
          'https://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml',
        versionPrefix: '29.',
        versionSuffix: '-android',
      },
      staticPreview: renderVersionBadge({ version: '29.0-android' }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'maven',
  }

  async fetch({ metadataUrl }) {
    return this._requestXml({
      schema,
      url: metadataUrl,
      parserOptions: { parseTagValue: false },
    })
  }

  async handle(_namedParams, { metadataUrl, versionPrefix, versionSuffix }) {
    const data = await this.fetch({ metadataUrl })
    let versions = data.metadata.versioning.versions.version.reverse()
    if (versionPrefix !== undefined) {
      versions = versions.filter(v => v.toString().startsWith(versionPrefix))
    }
    if (versionSuffix !== undefined) {
      versions = versions.filter(v => v.toString().endsWith(versionSuffix))
    }
    const version = versions[0]
    // if the filter returned no results, throw a NotFound
    if (
      (versionPrefix !== undefined || versionSuffix !== undefined) &&
      version === undefined
    )
      throw new NotFound({
        prettyMessage: 'version prefix or suffix not found',
      })
    return renderVersionBadge({ version })
  }
}
