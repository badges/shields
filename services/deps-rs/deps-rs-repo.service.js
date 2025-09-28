import { pathParams } from '../index.js'
import { BaseDepsRsService, description } from './deps-rs-base.js'

export default class DepsRsRepo extends BaseDepsRsService {
  static category = 'dependencies'
  static route = {
    base: 'deps-rs/repo',
    pattern: ':site(github|gitlab|bitbucket|sourcehut|codeberg)/:user/:repo',
  }

  static openApi = {
    '/deps-rs/repo/{site}/{user}/{repo}': {
      get: {
        summary: 'Deps.rs Repository Dependencies',
        description,
        parameters: pathParams(
          {
            name: 'site',
            example: 'github',
            schema: { type: 'string', enum: this.getEnum('site') },
          },
          {
            name: 'user',
            example: 'dtolnay',
          },
          {
            name: 'repo',
            example: 'syn',
          },
        ),
      },
    },
  }

  async handle({ site, user, repo }) {
    const json = await this.fetchRepo({ site, user, repo })
    return {
      message: json.message,
      color: this.constructor.mapColor(json.message),
    }
  }
}
