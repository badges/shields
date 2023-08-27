import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { NotFound } from '../index.js'
import {
  allVersionsSchema,
  BasePackagistService,
  customServerDocumentationFragment,
} from './packagist-base.js'

const queryParamSchema = Joi.object({
  server: optionalUrl,
  version: Joi.string(),
}).required()

export default class PackagistDependencyVersion extends BasePackagistService {
  static category = 'platform-support'

  static route = {
    base: 'packagist/dependency-v',
    pattern: ':user/:repo/:dependency+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Packagist Dependency Version',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
        dependency: 'twig/twig',
      },
      staticPreview: this.render({
        dependency: 'twig/twig',
        dependencyVersion: '2.13|^3.0.4',
      }),
    },
    {
      title: 'Packagist Dependency Version (specify version)',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
        dependency: 'twig/twig',
      },
      queryParams: {
        version: 'v2.8.0',
      },
      staticPreview: this.render({
        dependency: 'twig/twig',
        dependencyVersion: '1.12',
      }),
    },
    {
      title: 'Packagist Dependency Version (custom server)',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
        dependency: 'twig/twig',
      },
      queryParams: {
        server: 'https://packagist.org',
      },
      staticPreview: this.render({
        dependency: 'twig/twig',
        dependencyVersion: '2.13|^3.0.4',
      }),
      documentation: customServerDocumentationFragment,
    },
    {
      title: 'Packagist PHP Version',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
        dependency: 'php',
      },
      staticPreview: this.render({
        dependency: 'php',
        dependencyVersion: '^7.1.3',
      }),
    },
  ]

  static defaultBadgeData = {
    label: 'dependency version',
    color: 'blue',
  }

  static render({ dependency, dependencyVersion }) {
    return {
      label: dependency,
      message: dependencyVersion,
    }
  }

  async getDependencyVersion({
    json,
    user,
    repo,
    dependency,
    version = '',
    server,
  }) {
    let packageVersion
    const versions = BasePackagistService.expandPackageVersions(
      json,
      this.getPackageName(user, repo),
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
          server,
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

    // All dependencies' names in the 'require' section from the response should be lowercase,
    // so that we can compare lowercase name of the dependency given via url by the user.
    Object.keys(packageVersion.require).forEach(dependency => {
      packageVersion.require[dependency.toLowerCase()] =
        packageVersion.require[dependency]
    })

    const depLowerCase = dependency.toLowerCase()

    if (!packageVersion.require[depLowerCase]) {
      throw new NotFound({ prettyMessage: 'version requirement not found' })
    }

    return { dependencyVersion: packageVersion.require[depLowerCase] }
  }

  async handle({ user, repo, dependency }, { server, version = '' }) {
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
      dependency,
      version,
      server,
    })

    return this.constructor.render({
      dependency,
      dependencyVersion,
    })
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
          this.getPackageName(user, repo),
        )

        return versions[this.findVersionIndex(versions, version)]
      } catch (e) {
        return release
      }
    }
  }
}
