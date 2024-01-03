import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { optionalUrl } from '../validators.js'
import { redirector, pathParam, queryParam } from '../index.js'
import {
  BasePackagistService,
  customServerDocumentationFragment,
  description,
} from './packagist-base.js'

const packageSchema = Joi.array().items(
  Joi.object({
    version: Joi.string().required(),
  }),
)

const schema = Joi.object({
  packages: Joi.object().pattern(/^/, packageSchema).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
  include_prereleases: Joi.equal(''),
}).required()

class PackagistVersion extends BasePackagistService {
  static category = 'version'

  static route = {
    base: 'packagist/v',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/packagist/v/{user}/{repo}': {
      get: {
        summary: 'Packagist Version',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'symfony',
          }),
          pathParam({
            name: 'repo',
            example: 'symfony',
          }),
          queryParam({
            name: 'include_prereleases',
            schema: { type: 'boolean' },
            example: null,
          }),
          queryParam({
            name: 'server',
            description: customServerDocumentationFragment,
            example: 'https://packagist.org',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'packagist',
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle(
    { user, repo },
    { include_prereleases: includePrereleases, server },
  ) {
    includePrereleases = includePrereleases !== undefined
    const json = await this.fetch({
      user,
      repo,
      schema,
      server,
    })
    const versions = json.packages[this.getPackageName(user, repo)]
    const { version } = this.findLatestRelease(versions, includePrereleases)
    return this.constructor.render({ version })
  }
}

const PackagistVersionRedirector = redirector({
  category: 'version',
  route: {
    base: 'packagist/vpre',
    pattern: ':user/:repo',
  },
  transformPath: ({ user, repo }) => `/packagist/v/${user}/${repo}`,
  transformQueryParams: params => ({ include_prereleases: null }),
  dateAdded: new Date('2019-12-15'),
})

export { PackagistVersion, PackagistVersionRedirector }
