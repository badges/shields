import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderSizeBadge } from '../size.js'
import { nonNegativeInteger } from '../validators.js'
import {
  BaseVisualStudioAppCenterService,
  description,
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

  static openApi = {
    '/visual-studio-app-center/releases/size/{owner}/{app}/{token}': {
      get: {
        summary: 'Visual Studio App Center Size',
        description,
        parameters: pathParams(
          {
            name: 'owner',
            example: 'jct',
          },
          {
            name: 'app',
            example: 'my-amazing-app',
          },
          {
            name: 'token',
            example: 'ac70cv...',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'size',
    color: 'blue',
  }

  async handle({ owner, app, token }) {
    const { size } = await this.fetch({ owner, app, token, schema })
    return renderSizeBadge(size, 'metric')
  }
}
