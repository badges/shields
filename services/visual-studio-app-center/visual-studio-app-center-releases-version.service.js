import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import {
  BaseVisualStudioAppCenterService,
  description,
} from './visual-studio-app-center-base.js'

const schema = Joi.object({
  version: Joi.string().required(),
  short_version: Joi.string().required().allow(''),
}).required()

export default class VisualStudioAppCenterReleasesVersion extends BaseVisualStudioAppCenterService {
  static category = 'version'

  static route = {
    base: 'visual-studio-app-center/releases/version',
    pattern: ':owner/:app/:token',
  }

  static openApi = {
    '/visual-studio-app-center/releases/version/{owner}/{app}/{token}': {
      get: {
        summary: 'Visual Studio App Center Releases',
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
    label: 'release',
  }

  async handle({ owner, app, token }) {
    const { version, short_version: shortVersion } = await this.fetch({
      owner,
      app,
      token,
      schema,
    })
    if (!shortVersion) {
      return renderVersionBadge({ version })
    }
    return renderVersionBadge({
      version: `${shortVersion} (${version})`,
    })
  }
}
