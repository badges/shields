'use strict'

const NPMBase = require('../npm/npm-base')
const { versionColorForRange } = require('./node-version-color')

const keywords = ['npm']

module.exports = class NodeVersion extends NPMBase {
  static get category() {
    return 'platform-support'
  }

  static get defaultBadgeData() {
    return { label: 'node' }
  }

  static get route() {
    return this.buildRoute('node/v', { withTag: true })
  }

  static get examples() {
    return [
      {
        title: 'node',
        pattern: ':packageName',
        namedParams: { packageName: 'passport' },
        staticExample: this.renderStaticExample({
          nodeVersionRange: '>= 6.0.0',
        }),
        keywords,
      },
      {
        title: 'node (scoped)',
        pattern: '@:scope/:packageName',
        namedParams: { scope: 'stdlib', packageName: 'stdlib' },
        staticExample: this.renderStaticExample({
          nodeVersionRange: '>= 6.0.0',
        }),
        keywords,
      },
      {
        title: 'node (tag)',
        pattern: ':packageName/:tag',
        namedParams: { packageName: 'passport', tag: 'latest' },
        staticExample: this.renderStaticExample({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
      },
      {
        title: 'node (scoped with tag)',
        pattern: '@:scope/:packageName/:tag',
        namedParams: { scope: 'stdlib', packageName: 'stdlib', tag: 'latest' },
        staticExample: this.renderStaticExample({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
      },
      {
        title: 'node (scoped with tag, custom registry)',
        pattern: '@:scope/:packageName/:tag',
        namedParams: { scope: 'stdlib', packageName: 'stdlib', tag: 'latest' },
        query: { registry_uri: 'https://registry.npmjs.com' },
        staticExample: this.renderStaticExample({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
      },
    ]
  }

  static renderStaticExample({ tag, nodeVersionRange }) {
    // This should match the behavior of `async render()`, which is enforced
    // with a unit test.
    return {
      label: tag ? `node@${tag}` : undefined,
      message: nodeVersionRange,
      color: 'brightgreen',
    }
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
