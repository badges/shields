import { pathParam, queryParam } from '../index.js'
import { getDependencyVersion } from '../package-json-helpers.js'
import NpmBase, {
  queryParamSchema,
  packageNameDescription,
} from './npm-base.js'

export default class NpmDependencyVersion extends NpmBase {
  static category = 'platform-support'

  static route = {
    base: 'npm/dependency-version',
    pattern:
      ':scope(@[^/]+)?/:packageName/:kind(dev|peer)?/:dependencyScope(@[^/]+)?/:dependency',
    queryParamSchema,
  }

  static openApi = {
    '/npm/dependency-version/{packageName}/{dependency}': {
      get: {
        summary: 'NPM (prod) Dependency Version',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'react-boxplot',
            description: packageNameDescription,
          }),
          pathParam({
            name: 'dependency',
            example: 'simple-statistics',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
    '/npm/dependency-version/{packageName}/{kind}/{dependency}': {
      get: {
        summary: 'NPM dev or peer Dependency Version',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'react-boxplot',
            description: packageNameDescription,
          }),
          pathParam({
            name: 'kind',
            example: 'dev',
            schema: { type: 'string', enum: this.getEnum('kind') },
          }),
          pathParam({
            name: 'dependency',
            example: 'prop-types',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
  }

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
      queryParams,
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

    const range = getDependencyVersion({
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
