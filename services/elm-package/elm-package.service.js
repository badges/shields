import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { semver } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({ version: semver }).required()

export default class ElmPackage extends BaseJsonService {
  static category = 'version'
  static route = { base: 'elm-package/v', pattern: ':user/:packageName' }
  static examples = [
    {
      title: 'Elm package',
      namedParams: { user: 'elm', packageName: 'core' },
      staticPreview: this.render({ version: '1.0.2' }),
    },
  ]

  static defaultBadgeData = { label: 'elm package' }

  static render(props) {
    return renderVersionBadge(props)
  }

  async handle({ user, packageName }) {
    const url = `https://package.elm-lang.org/packages/${user}/${packageName}/latest/elm.json`
    const { version } = await this._requestJson({
      schema,
      url,
      errorMessages: {
        404: 'package not found',
      },
    })
    return this.constructor.render({ version })
  }
}
