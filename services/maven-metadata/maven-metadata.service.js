import Joi from 'joi'
import { compare } from 'mvncmp'
import { url } from '../validators.js'
import { renderVersionBadge } from '../version.js'
import {
  BaseXmlService,
  InvalidParameter,
  InvalidResponse,
  queryParams,
} from '../index.js'

const strategyEnum = ['highestVersion', 'releaseProperty', 'latestProperty']

const strategyDocs = `The strategy used to determine the version that will be shown
<ul>
  <li><code>highestVersion</code> - sort versions using Maven's ComparableVersion semantics (default)</li>
  <li><code>releaseProperty</code> - use the "release" metadata property</li>
  <li><code>latestProperty</code> - use the "latest" metadata property</li>
</ul>`

const queryParamSchema = Joi.object({
  metadataUrl: url,
  versionPrefix: Joi.string().optional(),
  versionSuffix: Joi.string().optional(),
  strategy: Joi.string()
    .valid(...strategyEnum)
    .default('highestVersion')
    .optional(),
}).required()

const schema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      latest: Joi.string(),
      release: Joi.string(),
      versions: Joi.object({
        version: Joi.array().items(Joi.string()).single(),
      }),
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
        parameters: queryParams(
          {
            name: 'metadataUrl',
            example:
              'https://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml',
            required: true,
          },
          {
            name: 'strategy',
            description: strategyDocs,
            schema: { type: 'string', enum: strategyEnum },
            example: 'highestVersion',
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

  static getLatestVersion(data, strategy) {
    if (strategy === 'latestProperty') {
      if (data.metadata.versioning.latest === undefined) {
        throw new InvalidResponse({
          prettyMessage: "property 'latest' not found",
        })
      }
      return data.metadata.versioning.latest
    } else if (strategy === 'releaseProperty') {
      if (data.metadata.versioning.release === undefined) {
        throw new InvalidResponse({
          prettyMessage: "property 'release' not found",
        })
      }
      return data.metadata.versioning.release
    } else if (strategy === 'highestVersion') {
      if (
        data.metadata.versioning.versions.version === undefined ||
        data.metadata.versioning.versions.version.length === 0
      ) {
        throw new InvalidResponse({
          prettyMessage: 'no versions found',
        })
      }
      return data.metadata.versioning.versions.version
        .sort(compare)
        .reverse()[0]
    }
    throw new InvalidParameter({ prettyMessage: 'unknown strategy' })
  }

  async handle(
    _namedParams,
    { metadataUrl, versionPrefix, versionSuffix, strategy },
  ) {
    if (versionPrefix !== undefined || versionSuffix !== undefined) {
      throw new InvalidParameter({
        prettyMessage:
          'versionPrefix and versionSuffix params have been removed',
      })
    }
    const data = await this.fetch({ metadataUrl })
    return renderVersionBadge({
      version: this.constructor.getLatestVersion(data, strategy),
    })
  }
}
