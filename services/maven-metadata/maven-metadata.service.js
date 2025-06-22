import Joi from 'joi'
import { matcher } from 'matcher'
import { compare } from 'mvncmp'
import { url } from '../validators.js'
import { renderVersionBadge } from '../version.js'
import {
  BaseXmlService,
  InvalidParameter,
  InvalidResponse,
  NotFound,
  queryParams,
} from '../index.js'
import { strategyEnum, commonParams } from './maven-metadata.js'

const queryParamSchema = Joi.object({
  metadataUrl: url,
  // versionPrefix and versionSuffix params are undocumented
  // but supported for legacy compatibility
  versionPrefix: Joi.string().optional(),
  versionSuffix: Joi.string().optional(),
  // filter is now the preferred way to do this
  filter: Joi.string().optional(),
  strategy: Joi.string()
    .valid(...strategyEnum)
    .default('highestVersion')
    .optional(),
})
  // versionPrefix/Suffix are invalid
  // when combined with filter
  .oxor('filter', 'versionPrefix')
  .oxor('filter', 'versionSuffix')

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
          ...commonParams,
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

  static applyFilter({ versions, filter }) {
    if (!filter) {
      return versions
    }
    return matcher(versions, filter)
  }

  static getLatestVersion({ data, strategy, filter }) {
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
        data.metadata.versioning.versions?.version === undefined ||
        data.metadata.versioning.versions?.version?.length === 0
      ) {
        throw new InvalidResponse({
          prettyMessage: 'no versions found',
        })
      }
      const versions = this.applyFilter({
        versions: data.metadata.versioning.versions.version,
        filter,
      })
      if (versions.length === 0) {
        throw new NotFound({ prettyMessage: 'no matching versions found' })
      }
      return versions.sort(compare).reverse()[0]
    }
    throw new InvalidParameter({ prettyMessage: 'unknown strategy' })
  }

  async handle(
    _namedParams,
    { metadataUrl, versionPrefix, versionSuffix, strategy, filter },
  ) {
    if (
      (versionPrefix !== undefined ||
        versionSuffix !== undefined ||
        filter !== undefined) &&
      strategy !== 'highestVersion'
    ) {
      throw new InvalidParameter({
        prettyMessage: `filter is not valid with strategy ${strategy}`,
      })
    }

    if (versionPrefix !== undefined || versionSuffix !== undefined) {
      filter = `${versionPrefix || ''}*${versionSuffix || ''}`
    }

    const data = await this.fetch({ metadataUrl })
    return renderVersionBadge({
      version: this.constructor.getLatestVersion({ data, strategy, filter }),
    })
  }
}
