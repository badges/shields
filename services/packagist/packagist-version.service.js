'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { compare, isStable, latest } = require('../php-version')
const { optionalUrl } = require('../validators')
const { NotFound, redirector } = require('..')
const {
  allVersionsSchema,
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
} = require('./packagist-base')

const packageSchema = Joi.array().items(
  Joi.object({
    version: Joi.string(),
    extra: Joi.any(),
  })
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

    let versions = []
    const aliasesMap = {}

    versionsData.forEach(version => {
      if (version.extra && version.extra['branch-alias']) {
        // eg, version is 'dev-master', mapped to '2.0.x-dev'.
        const validVersion =
          version.extra['branch-alias'][
            Object.keys(version.extra['branch-alias'])
          ]
        if (
          aliasesMap[validVersion] === undefined ||
          compare(aliasesMap[validVersion], validVersion) < 0
        ) {
          versions.push(validVersion)
          aliasesMap[validVersion] = version.version
        }
      }

      versions.push(version.version)
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

module.exports = { PackagistVersion, PackagistVersionRedirector }
