import Joi from 'joi'
import { pathParams } from '../index.js'
import {
  BaseVisualStudioAppCenterService,
  description,
} from './visual-studio-app-center-base.js'

const schema = Joi.object({
  app_os: Joi.string().required(),
  min_os: Joi.string().required(),
}).required()

export default class VisualStudioAppCenterReleasesOSVersion extends BaseVisualStudioAppCenterService {
  static category = 'version'

  static route = {
    base: 'visual-studio-app-center/releases/osver',
    pattern: ':owner/:app/:token',
  }

  static openApi = {
    '/visual-studio-app-center/releases/osver/{owner}/{app}/{token}': {
      get: {
        summary: 'Visual Studio App Center (Minimum) OS Version',
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
    label: 'min version',
    color: 'blue',
  }

  static render({ appOS, minOS }) {
    return {
      label: `${appOS.toLowerCase()}`,
      message: `${minOS}+`,
    }
  }

  async handle({ owner, app, token }) {
    const { app_os: appOS, min_os: minOS } = await this.fetch({
      owner,
      app,
      token,
      schema,
    })
    return this.constructor.render({ appOS, minOS })
  }
}
