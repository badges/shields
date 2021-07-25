import NPMBase from '../npm/npm-base.js'

const keywords = ['npm']

export default class NodeVersionBase extends NPMBase {
  static category = 'platform-support'

  static get examples() {
    const type = this.type
    const documentation = `
  <p>
    ${this.documentation}
    The node version support is retrieved from the <code>engines.node</code> section in package.json.
  </p>
`
    const prefix = `node-${type}`
    return [
      {
        title: `${prefix}`,
        pattern: ':packageName',
        namedParams: { packageName: 'passport' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
        }),
        keywords,
        documentation,
      },
      {
        title: `${prefix} (scoped)`,
        pattern: '@:scope/:packageName',
        namedParams: { scope: 'stdlib', packageName: 'stdlib' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
        }),
        keywords,
        documentation,
      },
      {
        title: `${prefix} (tag)`,
        pattern: ':packageName/:tag',
        namedParams: { packageName: 'passport', tag: 'latest' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
        documentation,
      },
      {
        title: `${prefix} (scoped with tag)`,
        pattern: '@:scope/:packageName/:tag',
        namedParams: { scope: 'stdlib', packageName: 'stdlib', tag: 'latest' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
        documentation,
      },
      {
        title: `${prefix} (scoped with tag, custom registry)`,
        pattern: '@:scope/:packageName/:tag',
        namedParams: { scope: 'stdlib', packageName: 'stdlib', tag: 'latest' },
        queryParams: { registry_uri: 'https://registry.npmjs.com' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
        documentation,
      },
    ]
  }

  static renderStaticPreview({ tag, nodeVersionRange }) {
    // Since this badge has an async `render()` function, but `get examples()` has to
    // be synchronous, this method exists. It should return the same value as the
    // real `render()`. There's a unit test to check that.
    return {
      label: tag ? `${this.defaultBadgeData.label}@${tag}` : undefined,
      message: nodeVersionRange,
      color: 'brightgreen',
    }
  }

  static async render({ tag, nodeVersionRange }) {
    // Atypically, the `render()` function of this badge is `async` because it needs to pull
    // data from the server.
    const label = tag ? `${this.defaultBadgeData.label}@${tag}` : undefined

    if (nodeVersionRange === undefined) {
      return {
        label,
        message: 'not specified',
        color: 'lightgray',
      }
    } else {
      return {
        label,
        message: nodeVersionRange,
        color: await this.colorResolver(nodeVersionRange),
      }
    }
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, tag, registryUrl } =
      this.constructor.unpackParams(namedParams, queryParams)
    const { engines } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
      tag,
    })

    const { node: nodeVersionRange } = engines || {}

    return this.constructor.render({ tag, nodeVersionRange })
  }
}
