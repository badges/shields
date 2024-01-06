import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { NotFound, pathParams } from '../index.js'
import {
  BaseVisualStudioAppCenterService,
  description,
} from './visual-studio-app-center-base.js'

const schema = Joi.array().items({
  result: isBuildStatus.required(),
})

export default class VisualStudioAppCenterBuilds extends BaseVisualStudioAppCenterService {
  static category = 'build'

  static route = {
    base: 'visual-studio-app-center/builds',
    pattern: ':owner/:app/:branch/:token',
  }

  static openApi = {
    '/visual-studio-app-center/builds/{owner}/{app}/{branch}/{token}': {
      get: {
        summary: 'Visual Studio App Center Builds',
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
            name: 'branch',
            example: 'master',
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
    label: 'build',
  }

  async handle({ owner, app, branch, token }) {
    const json = await this.fetch({
      token,
      schema,
      url: `https://api.appcenter.ms/v0.1/apps/${owner}/${app}/branches/${branch}/builds`,
    })
    if (json[0] === undefined)
      // Fetch will return a 200 with no data if no builds were found.
      throw new NotFound({ prettyMessage: 'no builds found' })
    return renderBuildStatusBadge({ status: json[0].result })
  }
}
