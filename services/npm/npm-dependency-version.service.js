import { getDependencyVersion } from '../package-json-helpers.js'
import NpmBase from './npm-base.js'

const { queryParamSchema } = NpmBase
const keywords = ['node']

export default class NpmDependencyVersion extends NpmBase {
  static category = 'platform-support'

  static route = {
    base: 'npm/dependency-version',
    pattern:
      ':scope(@[^/]+)?/:packageName/:kind(dev|peer)?/:dependencyScope(@[^/]+)?/:dependency',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'npm peer dependency version',
      pattern: ':packageName/peer/:dependency',
      namedParams: {
        packageName: 'react-boxplot',
        dependency: 'prop-types',
      },
      staticPreview: this.render({
        dependency: 'prop-types',
        range: '^15.5.4',
      }),
      keywords,
    },
    {
      title: 'npm peer dependency version (scoped)',
      pattern: ':scope?/:packageName/peer/:dependencyScope?/:dependency',
      namedParams: {
        scope: '@swellaby',
        packageName: 'eslint-config',
        dependency: 'eslint',
      },
      staticPreview: this.render({
        dependency: 'eslint',
        range: '^3.0.0',
      }),
      keywords,
    },
    {
      title: 'npm dev dependency version',
      pattern: ':packageName/dev/:dependency',
      namedParams: {
        packageName: 'react-boxplot',
        dependency: 'eslint-config-standard',
      },
      staticPreview: this.render({
        dependency: 'eslint-config-standard',
        range: '^12.0.0',
      }),
      keywords,
    },
    {
      title: 'npm dev dependency version (scoped)',
      pattern: ':scope?/:packageName/dev/:dependencyScope?/:dependency',
      namedParams: {
        packageName: 'mocha',
        dependencyScope: '@mocha',
        dependency: 'contributors',
      },
      staticPreview: this.render({
        dependency: '@mocha/contributors',
        range: '^1.0.3',
      }),
      keywords,
    },
    {
      title: 'npm (prod) dependency version',
      pattern: ':packageName/:dependency',
      namedParams: {
        packageName: 'react-boxplot',
        dependency: 'simple-statistics',
      },
      staticPreview: this.render({
        dependency: 'simple-statistics',
        range: '^6.1.1',
      }),
      keywords,
    },
    {
      title: 'npm (prod) dependency version (scoped)',
      pattern: ':scope?/:packageName/:dependencyScope?/:dependency',
      namedParams: {
        packageName: 'got',
        dependencyScope: '@sindresorhus',
        dependency: 'is',
      },
      staticPreview: this.render({
        dependency: '@sindresorhus/is',
        range: '^0.15.0',
      }),
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'dependency',
  }

  static render({ dependency, range }) {
    return {
      label: dependency,
      message: range,
      color: 'blue',
    }
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams
    )
    const { kind, dependency, dependencyScope } = namedParams
    const wantedDependency = `${
      dependencyScope ? `${dependencyScope}/` : ''
    }${dependency}`

    const { dependencies, devDependencies, peerDependencies } =
      await this.fetchPackageData({
        scope,
        packageName,
        registryUrl,
      })

    const { range } = getDependencyVersion({
      kind,
      wantedDependency,
      dependencies,
      devDependencies,
      peerDependencies,
    })

    return this.constructor.render({
      dependency: wantedDependency,
      range,
    })
  }
}
