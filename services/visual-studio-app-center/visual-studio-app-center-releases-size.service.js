import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { nonNegativeInteger } from '../validators.js'
import {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} from './visual-studio-app-center-base.js'

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

export default class VisualStudioAppCenterReleasesSize extends BaseVisualStudioAppCenterService {
  static category = 'size'

  static route = {
    base: 'visual-studio-app-center/releases/size',
    pattern: ':owner/:app/:token',
  }

  static examples = [
    {
      title: 'Visual Studio App Center Size',
      namedParams: {
        owner: 'jct',
        app: 'my-amazing-app',
        token: 'ac70cv...',
      },
      staticPreview: this.render({ size: 8368844 }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'size',
    color: 'blue',
  }

  static render({ size }) {
    return {
      message: prettyBytes(size),
    }
  }

  async handle({ owner, app, token }) {
    const { size } = await this.fetch({ owner, app, token, schema })
    return this.constructor.render({ size })
  }
}
