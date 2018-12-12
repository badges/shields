'use strict'

const { InvalidParameter } = require('../errors')
const NpmBase = require('./npm-base')

const keywords = ['node']

module.exports = class NpmDependencyVersion extends NpmBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    const { queryParams } = this.buildRoute('')
    return {
      base: 'npm/dependency-version',
      pattern: ':scope(@[^/]+)?/:packageName/:kind(dev|peer)?/:dependency',
      queryParams,
    }
  }

  static get examples() {
    return [
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
        title: 'npm dev dependency version',
        pattern: ':packageName/dev/:dependency',
        namedParams: {
          packageName: 'react-boxplot',
          kind: 'dev',
          dependency: 'eslint-config-standard',
        },
        staticPreview: this.render({
          dependency: 'eslint-config-standard',
          range: '^12.0.0',
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
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'dependency',
    }
  }

  static render({ dependency, range }) {
    return {
      label: dependency,
      message: range,
      color: 'blue',
    }
  }

  transform({
    kind,
    wantedDependency,
    dependencies,
    devDependencies,
    peerDependencies,
  }) {
    let dependenciesOfKind
    if (kind === 'peer') {
      dependenciesOfKind = peerDependencies
    } else if (kind === 'dev') {
      dependenciesOfKind = devDependencies
    } else {
      dependenciesOfKind = dependencies
    }

    const range = dependenciesOfKind[wantedDependency]
    if (range === undefined) {
      throw new InvalidParameter({ prettyMessage: 'not found' })
    }

    return { range }
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams
    )
    const { kind, dependency: wantedDependency } = namedParams

    const {
      dependencies,
      devDependencies,
      peerDependencies,
    } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    })

    const { range } = this.transform({
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
