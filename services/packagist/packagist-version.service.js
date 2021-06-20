import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { compare, isStable, latest } from '../php-version.js'
import { optionalUrl } from '../validators.js'
import { NotFound, redirector } from '../index.js'
import {
  allVersionsSchema,
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
} from './packagist-base.js'

const packageSchema = Joi.object()
  .pattern(
    /^/,
    Joi.object({
      version: Joi.string(),
      extra: Joi.object({
        'branch-alias': Joi.object().pattern(/^/, Joi.string()),
      }),
    }).required()
  )
  .required()

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

  static examples = [
    {
      title: 'Packagist Version',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
      },
      staticPreview: renderVersionBadge({ version: '4.2.2' }),
      keywords,
    },
    {
      title: 'Packagist Version (including pre-releases)',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
      },
      queryParams: { include_prereleases: null },
      staticPreview: renderVersionBadge({ version: '4.3-dev' }),
      keywords,
    },
    {
      title: 'Packagist Version (custom server)',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
      },
      queryParams: {
        server: 'https://packagist.org',
      },
      staticPreview: renderVersionBadge({ version: '4.2.2' }),
      keywords,
      documentation: customServerDocumentationFragment,
    },
  ]

  static defaultBadgeData = {
    label: 'packagist',
  }

  static render({ version }) {
    if (version === undefined) {
      throw new NotFound({ prettyMessage: 'no released version found' })
    }
    return renderVersionBadge({ version })
  }

  transform({ includePrereleases, json, user, repo }) {
    const versionsData = json.packages[this.getPackageName(user, repo)]
    let versions = Object.keys(versionsData)
    const aliasesMap = {}
    versions.forEach(version => {
      const versionData = versionsData[version]
      if (
        versionData.extra &&
        versionData.extra['branch-alias'] &&
        versionData.extra['branch-alias'][version]
      ) {
        // eg, version is 'dev-master', mapped to '2.0.x-dev'.
        const validVersion = versionData.extra['branch-alias'][version]
        if (
          aliasesMap[validVersion] === undefined ||
          compare(aliasesMap[validVersion], validVersion) < 0
        ) {
          versions.push(validVersion)
          aliasesMap[validVersion] = version
        }
      }
    })

    versions = versions.filter(version => !/^dev-/.test(version))

    if (includePrereleases) {
      return { version: latest(versions) }
    } else {
      const stableVersion = latest(versions.filter(isStable))
      return { version: stableVersion || latest(versions) }
    }
  }

  async handle(
    { user, repo },
    { include_prereleases: includePrereleases, server }
  ) {
    includePrereleases = includePrereleases !== undefined
    const json = await this.fetch({
      user,
      repo,
      schema: includePrereleases ? schema : allVersionsSchema,
      server,
    })
    const { version } = this.transform({ includePrereleases, json, user, repo })
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
