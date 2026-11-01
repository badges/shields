import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { baseDescription } from './pub-common.js'

const description = `${baseDescription}
  <p>This badge shows the Dart SDK constraint of a package, indicating which Dart SDK versions the package supports.</p>`

const schema = Joi.object({
  latest: Joi.object({
    pubspec: Joi.object({
      environment: Joi.object({
        sdk: Joi.string().required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

export default class PubDartSdkVersion extends BaseJsonService {
  static category = 'platform-support'

  static route = { base: 'pub/sdk-version', pattern: ':packageName' }

  static openApi = {
    '/pub/sdk-version/{packageName}': {
      get: {
        summary: 'Pub SDK Version',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'http',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'dart sdk' }

  static render({ sdkConstraint }) {
    return {
      label: 'dart sdk',
      message: sdkConstraint,
      color: 'blue',
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dev/api/packages/${packageName}`,
    })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    const sdkConstraint = data.latest?.pubspec?.environment?.sdk
    if (!sdkConstraint) {
      throw new NotFound({ prettyMessage: 'sdk constraint not found' })
    }
    return this.constructor.render({ sdkConstraint })
  }
}
