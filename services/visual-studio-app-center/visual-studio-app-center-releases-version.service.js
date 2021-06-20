import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} from './visual-studio-app-center-base.js'

const schema = Joi.object({
  version: Joi.string().required(),
  short_version: Joi.string().required(),
}).required()

export default class VisualStudioAppCenterReleasesVersion extends BaseVisualStudioAppCenterService {
  static category = 'version'

  static route = {
    base: 'visual-studio-app-center/releases/version',
    pattern: ':owner/:app/:token',
  }

  static examples = [
    {
      title: 'Visual Studio App Center Releases',
      namedParams: {
        owner: 'jct',
        app: 'my-amazing-app',
        token: 'ac70cv...',
      },
      staticPreview: renderVersionBadge({ version: '1.0 (4)' }),
      keywords,
      documentation,
    },
  ]

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
    return renderVersionBadge({
      version: `${shortVersion} (${version})`,
    })
  }
}
