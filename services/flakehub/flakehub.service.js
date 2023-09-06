import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const schema = Joi.object({
  latest: Joi.string().required(),
}).required()

export default class FlakeHub extends BaseJsonService {
  static category = 'version'
  static route = { base: 'flakehub/flake', pattern: ':org/:project' }
  static openApi = {
    '/flakehub/flake/{org}/{project}': {
      get: {
        summary: 'FlakeHub flake version',
        parameters: pathParams(
          {
            name: 'org',
            example: 'DeterminateSystems',
          },
          {
            name: 'project',
            example: 'flake-schemas',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'flakehub' }

  async handle({ org, project }) {
    const data = await this._requestJson({
      schema,
      url: `https://api.flakehub.com/badge/${encodeURIComponent(
        org,
      )}/${encodeURIComponent(project)}`,
    })

    // the upstream API indicates "not found"
    // by returning a 200 OK with a null body
    if (data === null) {
      throw new NotFound()
    }

    return renderVersionBadge({ version: data.latest })
  }
}
