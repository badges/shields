'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { compare, isStable, latest } = require('../php-version')
const { optionalUrl } = require('../validators')
const {
  allVersionsSchema,
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
} = require('./packagist-base')
const { NotFound } = require('..')

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
  packages: Joi.object()
    .pattern(/^/, packageSchema)
    .required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

module.exports = class PackagistVersion extends BasePackagistService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'packagist',
      pattern: ':type(v|vpre)/:user/:repo',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist Version',
        pattern: 'v/:user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: renderVersionBadge({ version: '4.2.2' }),
        keywords,
      },
      {
        title: 'Packagist Pre Release Version',
        pattern: 'vpre/:user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: renderVersionBadge({ version: '4.3-dev' }),
        keywords,
      },
      {
        title: 'Packagist Version (custom server)',
        pattern: 'v/:user/:repo',
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
  }

  static get defaultBadgeData() {
    return {
      label: 'packagist',
    }
  }

  static render({ version }) {
    if (version === undefined) {
      throw new NotFound({ prettyMessage: 'no released version found' })
    }
    return renderVersionBadge({ version })
  }

  transform({ type, json, user, repo }) {
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

    if (type === 'vpre') {
      return { version: latest(versions) }
    } else {
      const stableVersion = latest(versions.filter(isStable))
      return { version: stableVersion || latest(versions) }
    }
  }

  async handle({ type, user, repo }, { server }) {
    const json = await this.fetch({
      user,
      repo,
      schema: type === 'v' ? allVersionsSchema : schema,
      server,
    })
    const { version } = this.transform({ type, json, user, repo })
    return this.constructor.render({ version })
  }
}
