import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object().pattern(Joi.string(), Joi.string()).required()

export default class ReproducibleCentral extends BaseJsonService {
  static category = 'dependencies'

  static route = {
    base: 'reproducible-central/artifact',
    pattern: ':groupId/:artifactId/:version',
  }

  static openApi = {
    '/reproducible-central/artifact/{groupId}/{artifactId}/{version}': {
      get: {
        summary: 'Reproducible Central Artifact',
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
    label: 'reproducible builds',
  }

  static render({ message, color }) {
    if (message === undefined) {
      color = 'red'
      message = 'version not available in Maven Central'
    } else if (message === 'X') {
      color = 'red'
      message = 'unable to rebuild'
    } else if (message === '?') {
      color = 'grey'
      message = 'version not evaluated'
    } else if (message.indexOf('/') > 0) {
      // {ok}/{count}
      const ok = message.substring(0, message.indexOf('/'))
      const count = message.substring(message.indexOf('/') + 1)
      if (ok === count) {
        color = 'brightgreen'
      } else if (ok > count - ok) {
        color = 'yellow'
      } else {
        color = 'red'
      }
    }

    return {
      message,
      color,
    }
  }

  async fetch({ groupId, artifactId }) {
    return this._requestJson({
      schema,
      url: `https://jvm-repo-rebuild.github.io/reproducible-central/badge/artifact/${groupId.replace(/\./g, '/')}/${artifactId}.json`,
      httpErrors: {
        404: 'groupId:artifactId unknown',
      },
    })
  }

  async handle({ groupId, artifactId, version }) {
    if (version.endsWith('-SNAPSHOT')) {
      return this.constructor.render({
        message: 'SNAPSHOT, not evaluated',
        color: 'grey',
      })
    }

    const versions = await this.fetch({
      groupId,
      artifactId,
    })
    return this.constructor.render({ message: versions[version] })
  }
}
