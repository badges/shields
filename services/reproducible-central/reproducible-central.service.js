import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  color: Joi.string().required(),
  message: Joi.string().required(),
}).required()

export default class ReproducibleCentral extends BaseJsonService {
  static category = 'dependencies'

  static route = {
    base: 'reproducible-central/a',
    pattern: ':groupId/:artifactId/:version',
  }

  static openApi = {
    '/reproducible-central/a/{groupId}/{artifactId}/{version}': {
      get: {
        summary: 'Reproducible Central',
        parameters: pathParams(
          {
            name: 'groupId',
            example: 'org.apache.maven',
          },
          {
            name: 'artifactId',
            example: 'maven-core',
          },
          {
            name: 'version',
            example: '3.9.9',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'Reproducible Builds',
    labelColor: '1e5b96',
  }

  static render({ message, color }) {
    return {
      message,
      color,
    }
  }

  async fetch({ groupId, artifactId, version }) {
    return this._requestJson({
      schema,
      url: `https://jvm-repo-rebuild.github.io/reproducible-central/badge/artifact/${groupId.replace(/\./g, '/')}/${artifactId}/${version}.json`,
    })
  }

  async fetchIndex({ groupId, artifactId, version }) {
    const { res } = await this._requestFetcher({
      url: `https://jvm-repo-rebuild.github.io/reproducible-central/badge/artifact/${groupId.replace(/\./g, '/')}/${artifactId}/index.html`,
    })
    if (res.statusCode === 404) {
      return { message: 'unknown ga', color: 'orange' } // unknown project ga, whatever version
    } else {
      return { message: version, color: 'grey' } // unknown version for a known project ga
    }
  }

  async handle({ groupId, artifactId, version }) {
    if (version.endsWith('-SNAPSHOT')) {
      return this.constructor.render({ message: 'SNAPSHOT', color: 'grey' })
    }

    try {
      // try full gav
      const { message, color } = await this.fetch({
        groupId,
        artifactId,
        version,
      })
      return this.constructor.render({ message, color })
    } catch (e) {}
    // gav data not found: try ga
    const { message, color } = await this.fetchIndex({
      groupId,
      artifactId,
      version,
    })
    return this.constructor.render({ message, color })
  }
}
