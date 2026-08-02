import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { packageNameDescription } from '../npm/npm-base.js'

const librarySchema = Joi.object({
  ios: Joi.boolean(),
  android: Joi.boolean(),
  web: Joi.boolean(),
  windows: Joi.boolean(),
  macos: Joi.boolean(),
  tvos: Joi.boolean(),
  visionos: Joi.boolean(),
  expoGo: Joi.boolean(),
  fireos: Joi.boolean(),
  harmony: Joi.alternatives().try(Joi.boolean(), Joi.string()),
  horizon: Joi.boolean(),
  vegaos: Joi.alternatives().try(Joi.boolean(), Joi.string()),
})
  .unknown(true)
  .required()

const schema = Joi.object().pattern(Joi.string(), librarySchema).required()

const platforms = {
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  macos: 'macOS',
  tvos: 'tvOS',
  visionos: 'visionOS',
  windows: 'Windows',
  expoGo: 'Expo Go',
  fireos: 'Fire OS',
  harmony: 'Harmony',
  horizon: 'Horizon',
  vegaos: 'VegaOS',
}

export default class ReactNativeDirectory extends BaseJsonService {
  static category = 'platform-support'

  static route = {
    base: 'react-native-directory',
    pattern: ':scope(@[^/]+)?/:packageName',
  }

  static openApi = {
    '/react-native-directory/{packageName}': {
      get: {
        summary: 'React Native Directory Supported Platforms',
        parameters: pathParams({
          name: 'packageName',
          example: 'react-native-reanimated',
          description: packageNameDescription,
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'platforms' }

  static render(library) {
    const supportedPlatforms = Object.entries(platforms)
      .filter(([key]) => library[key])
      .map(([, name]) => name)

    return {
      message:
        supportedPlatforms.length > 0 ? supportedPlatforms.join(' | ') : 'none',
    }
  }

  async handle({ scope, packageName }) {
    const name = scope ? `${scope}/${packageName}` : packageName
    const response = await this._requestJson({
      schema,
      url: `https://reactnative.directory/api/library?name=${encodeURIComponent(
        name,
      )}`,
      httpErrors: { 404: 'package not found' },
    })

    const library = response[name]
    if (!library) {
      throw new NotFound({ prettyMessage: 'package not found' })
    }

    return this.constructor.render(library)
  }
}
