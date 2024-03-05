import NPMBase from '../npm/npm-base.js'

export default class NodeVersionBase extends NPMBase {
  static category = 'platform-support'

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
