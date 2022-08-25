import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { NotFound } from '../index.js'
import {
  allVersionsSchema,
  BasePackagistService,
  customServerDocumentationFragment,
} from './packagist-base.js'

const queryParamSchema = Joi.object({
  dependencyVendor: Joi.string(),
  dependencyRepo: Joi.string(),
  server: optionalUrl,
}).required()

export default class PackagistDependencyVersion extends BasePackagistService {
  static category = 'platform-support'

  static route = {
    base: 'packagist/dependency-v',
    pattern: ':user/:repo/:version?',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Packagist Dependency Version Support',
      pattern: ':user/:repo',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
      },
      queryParams: {
        dependencyVendor: 'twig',
        dependencyRepo: 'twig',
      },
      staticPreview: this.render({ dependencyVersion: '2.13|^3.0.4' }),
    },
    {
      title: 'Packagist Dependency Version Support (specify version)',
      pattern: ':user/:repo/:version',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
        version: 'v2.8.0',
      },
      queryParams: {
        dependencyVendor: 'twig',
        dependencyRepo: 'twig',
      },
      staticPreview: this.render({ dependencyVersion: '1.12' }),
    },
    {
      title: 'Packagist Dependency Version Support (custom server)',
      pattern: ':user/:repo',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
      },
      queryParams: {
        dependencyVendor: 'twig',
        dependencyRepo: 'twig',
        server: 'https://packagist.org',
      },
      staticPreview: this.render({ dependencyVersion: '2.13|^3.0.4' }),
      documentation: customServerDocumentationFragment,
    },
  ]

  static defaultBadgeData = {
    label: 'dependency version',
    color: 'blue',
  }

  static render({ dependencyVersion }) {
    return {
      message: dependencyVersion,
    }
  }

  findVersionIndex(json, version) {
    return json.findIndex(v => v.version === version)
  }

  async findSpecifiedVersion(json, user, repo, version, server) {
    let release

    if ((release = json[this.findVersionIndex(json, version)])) {
      return release
    } else {
      try {
        const allData = await this.fetchDev({
          user,
          repo,
          schema: allVersionsSchema,
          server,
        })

        const versions = BasePackagistService.expandPackageVersions(
          allData,
          this.getPackageName(user, repo)
        )

        return versions[this.findVersionIndex(versions, version)]
      } catch (e) {
        return release
      }
    }
  }

  async getDependencyVersion({
    json,
    user,
    repo,
    version = '',
    server,
    dependencyVendor,
    dependencyRepo,
  }) {
    let packageVersion
    const versions = BasePackagistService.expandPackageVersions(
      json,
      this.getPackageName(user, repo)
    )

    if (version === '') {
      packageVersion = this.findLatestRelease(versions)
    } else {
      try {
        packageVersion = await this.findSpecifiedVersion(
          versions,
          user,
          repo,
          version,
          server
        )
      } catch (e) {
        packageVersion = null
      }
    }

    if (!packageVersion) {
      throw new NotFound({ prettyMessage: 'invalid version' })
    }

    if (!packageVersion.require) {
      throw new NotFound({ prettyMessage: 'version requirement not found' })
    }

    let dependencyIdentifier

    const depVendLowercase = dependencyVendor?.toLowerCase()
    const depRepoLowercase = dependencyRepo?.toLowerCase()

    if (dependencyRepo || dependencyVendor) {
      if (!!dependencyRepo & !dependencyVendor) {
        dependencyIdentifier = depRepoLowercase
      } else if (!dependencyRepo & !!dependencyVendor) {
        dependencyIdentifier = depVendLowercase
      } else {
        dependencyIdentifier = `${depVendLowercase}/${depRepoLowercase}`
      }
    } else {
      throw new NotFound({
        prettyMessage: 'dependency vendor or repo not specified',
      })
    }

    if (!packageVersion.require[dependencyIdentifier]) {
      throw new NotFound({ prettyMessage: 'version requirement not found' })
    }

    return { dependencyVersion: packageVersion.require[dependencyIdentifier] }
  }

  async handle(
    { user, repo, version = '' },
    { dependencyVendor, dependencyRepo, server }
  ) {
    const allData = await this.fetch({
      user,
      repo,
      schema: allVersionsSchema,
      server,
    })

    const { dependencyVersion } = await this.getDependencyVersion({
      json: allData,
      user,
      repo,
      version,
      server,
      dependencyVendor,
      dependencyRepo,
    })

    return this.constructor.render({ dependencyVersion })
  }
}
