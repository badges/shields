'use strict'

const NPMBase = require('../npm/npm-base')
const { versionColorForRange } = require('./node-version-color')

module.exports = class NodeVersion extends NPMBase {
  static get category() {
    return 'platform-support'
  }

  static get defaultBadgeData() {
    return { label: 'node' }
  }

  static get url() {
    return this.buildUrl('node/v', { withTag: true })
  }

  static get examples() {
    return [
      {
        title: 'node',
        previewUrl: 'passport',
        keywords: ['npm'],
      },
      {
        title: 'node (scoped)',
        previewUrl: '@stdlib/stdlib',
        keywords: ['npm'],
      },
      {
        title: 'node (tag)',
        previewUrl: 'passport/latest',
        keywords: ['npm'],
      },
      {
        title: 'node (scoped with tag)',
        previewUrl: '@stdlib/stdlib/latest',
        keywords: ['npm'],
      },
      {
        title: 'node (scoped with tag, custom registry)',
        previewUrl: '@stdlib/stdlib/latest',
        query: { registry_uri: 'https://registry.npmjs.com' },
        keywords: ['npm'],
      },
    ]
  }

  static async render({ tag, nodeVersionRange }) {
    const label = tag ? `node@${tag}` : undefined

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
        color: await versionColorForRange(nodeVersionRange),
      }
    }
  }

  async handle(namedParams, queryParams) {
    const {
      scope,
      packageName,
      tag,
      registryUrl,
    } = this.constructor.unpackParams(namedParams, queryParams)
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
