import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { semver } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({ version: semver }).required()

export default class ElmPackage extends BaseJsonService {
  static category = 'version'
  static route = { base: 'elm-package/v', pattern: ':user/:packageName' }
  static openApi = {
    '/elm-package/v/{user}/{packageName}': {
      get: {
        summary: 'Elm package',
        parameters: pathParams(
          {
            name: 'user',
            example: 'elm',
          },
          {
            name: 'packageName',
            example: 'core',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'elm package' }

  static render(props) {
    return renderVersionBadge(props)
  }

  async handle({ user, packageName }) {
    const url = `https://package.elm-lang.org/packages/${user}/${packageName}/latest/elm.json`
    const { version } = await this._requestJson({
      schema,
      url,
      httpErrors: {
        404: 'package not found',
      },
    })
    return this.constructor.render({ version })
  }
}
