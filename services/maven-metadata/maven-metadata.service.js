import Joi from 'joi'
import { url } from '../validators.js'
import { renderVersionBadge } from '../version.js'
import { BaseXmlService, NotFound, queryParams } from '../index.js'
import { description } from './maven-metadata.js'

const queryParamSchema = Joi.object({
  metadataUrl: url,
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

  static openApi = {
    '/maven-metadata/v': {
      get: {
        summary: 'Maven metadata URL',
        description,
        parameters: queryParams(
          {
            name: 'metadataUrl',
            example:
              'https://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml',
            required: true,
          },
          {
            name: 'versionPrefix',
            example: '29',
            description: 'Filter only versions with this prefix.',
          },
          {
            name: 'versionSuffix',
            example: '-android',
            description: 'Filter only versions with this suffix.',
          },
        ),
      },
    },
  }

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
