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
      staticPreview: this.render({
        dependencyNameForLabel: 'twig/twig',
        dependencyVersion: '2.13|^3.0.4',
      }),
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
      staticPreview: this.render({
        dependencyNameForLabel: 'twig/twig',
        dependencyVersion: '1.12',
      }),
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
      staticPreview: this.render({
        dependencyNameForLabel: 'twig/twig',
        dependencyVersion: '2.13|^3.0.4',
      }),
      documentation: customServerDocumentationFragment,
    },
  ]

  static defaultBadgeData = {
    label: 'dependency version',
    color: 'blue',
  }

  static render({ dependencyNameForLabel, dependencyVersion }) {
    return {
      label: dependencyNameForLabel,
      message: dependencyVersion,
    }
  }

  determineDependencyNameForLabel({ dependencyVendor, dependencyRepo }) {
    if (dependencyVendor && dependencyRepo) {
      return `${dependencyVendor}/${dependencyRepo}`
    } else if (dependencyVendor && !dependencyRepo) {
      return dependencyVendor
    } else if (!dependencyVendor && dependencyRepo) {
      return dependencyRepo
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

    if (dependencyRepo || dependencyVendor) {
      dependencyIdentifier = this.determineDependencyNameForLabel({
        dependencyVendor,
        dependencyRepo,
      })
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

    const dependencyNameForLabel = this.determineDependencyNameForLabel({
      dependencyVendor,
      dependencyRepo,
    })

    return this.constructor.render({
      dependencyNameForLabel,
      dependencyVersion,
    })
  }
}
