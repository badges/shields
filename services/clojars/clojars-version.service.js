import Joi from 'joi'
import { version as versionColor } from '../color-formatters.js'
import { deprecatedService, pathParam, queryParam } from '../index.js'
import { BaseClojarsService, description } from './clojars-base.js'

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

class ClojarsVersionService extends BaseClojarsService {
  static category = 'version'
  static route = { base: 'clojars/v', pattern: ':clojar+', queryParamSchema }

  static openApi = {
    '/clojars/v/{clojar}': {
      get: {
        summary: 'Clojars Version',
        description,
        parameters: [
          pathParam({
            name: 'clojar',
            example: 'prismic',
          }),
          queryParam({
            name: 'include_prereleases',
            schema: { type: 'boolean' },
            example: null,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'clojars' }

  static render({ clojar, version }) {
    // clojars format is non standard to fit community style
    // dont use renderVersionBadge
    // see also https://github.com/badges/shields/pull/431
    // commit d0414c9
    return {
      message: `[${clojar} "${version}"]`,
      color: versionColor(version),
    }
  }

  async handle({ clojar }, queryParams) {
    const json = await this.fetch({ clojar })
    const includePrereleases = queryParams.include_prereleases !== undefined

    if (includePrereleases) {
      return this.constructor.render({ clojar, version: json.latest_version })
    }
    return this.constructor.render({
      clojar,
      version: json.latest_release ? json.latest_release : json.latest_version,
    })
  }
}

const ClojarsVersionRedirector = deprecatedService({
  category: 'version',
  label: 'clojars',
  route: {
    base: 'clojars/vpre',
    pattern: ':clojar',
  },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})

export { ClojarsVersionService, ClojarsVersionRedirector }
