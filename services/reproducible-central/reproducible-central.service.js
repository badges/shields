import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object()
  .pattern(Joi.string(), Joi.string().regex(/^\d+\/\d+$|^[X?]$/))
  .required()

const description = `
[Reproducible Central](https://github.com/jvm-repo-rebuild/reproducible-central)
provides [Reproducible Builds](https://reproducible-builds.org/) check status
for projects published to [Maven Central](https://central.sonatype.com/).
`

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
        description,
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

  static render(rebuildResult) {
    if (rebuildResult === undefined) {
      return { color: 'red', message: 'version not available in Maven Central' }
    } else if (rebuildResult === 'X') {
      return { color: 'red', message: 'unable to rebuild' }
    } else if (rebuildResult === '?') {
      return { color: 'grey', message: 'version not evaluated' }
    }

    const [ok, count] = rebuildResult.split('/')
    let color
    if (ok === count) {
      color = 'brightgreen'
    } else if (ok > count - ok) {
      color = 'yellow'
    } else {
      color = 'red'
    }
    return { color, message: rebuildResult }
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
      return {
        message: 'SNAPSHOT, not evaluated',
        color: 'grey',
      }
    }

    const versions = await this.fetch({
      groupId,
      artifactId,
    })
    return this.constructor.render(versions[version])
  }
}
