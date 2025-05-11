import Joi from 'joi'
import { url } from '../validators.js'
import { renderVersionBadge } from '../version.js'
import { BaseXmlService, InvalidParameter, queryParams } from '../index.js'

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
        parameters: queryParams({
          name: 'metadataUrl',
          example:
            'https://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml',
          required: true,
        }),
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
    if (versionPrefix !== undefined || versionSuffix !== undefined) {
      throw new InvalidParameter({
        prettyMessage:
          'versionPrefix and versionSuffix params have been removed',
      })
    }
    const data = await this.fetch({ metadataUrl })
    const versions = data.metadata.versioning.versions.version.reverse()
    const version = versions[0]
    return renderVersionBadge({ version })
  }
}
