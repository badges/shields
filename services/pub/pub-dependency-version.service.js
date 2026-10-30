import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { baseDescription } from './pub-common.js'

const schema = Joi.object({
  latest: Joi.object({
    pubspec: Joi.object({
      dependencies: Joi.object()
        .pattern(
          /./,
          Joi.alternatives()
            .try(
              Joi.string(),
              Joi.object({ version: Joi.string().allow(null) }),
            )
            .allow(null),
        )
        .allow(null),
    }).required(),
  }).required(),
}).required()

export default class PubDependencyVersion extends BaseJsonService {
  static category = 'platform-support'

  static route = {
    base: 'pub/dependency-version',
    pattern: ':packageName/:dependency',
  }

  static openApi = {
    '/pub/dependency-version/{packageName}/{dependency}': {
      get: {
        summary: 'Pub Dependency Version',
        description: `${baseDescription}
          <p>Shows the declared version constraint for a direct dependency in the
          latest published package. Development dependencies are not included.</p>`,
        parameters: pathParams(
          { name: 'packageName', example: 'http' },
          { name: 'dependency', example: 'http_parser' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'dependency version' }

  static render({ dependency, requirement }) {
    return {
      label: dependency,
      message:
        typeof requirement === 'string'
          ? requirement
          : (requirement?.version ?? 'any'),
      color: 'blue',
    }
  }

  async handle({ packageName, dependency }) {
    const data = await this._requestJson({
      schema,
      url: `https://pub.dev/api/packages/${packageName}`,
    })
    const dependencies = data.latest.pubspec.dependencies ?? {}
    if (!Object.hasOwn(dependencies, dependency)) {
      throw new NotFound({ prettyMessage: 'version requirement not found' })
    }
    return this.constructor.render({
      dependency,
      requirement: dependencies[dependency],
    })
  }
}
