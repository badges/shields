'use strict'

const NPMBase = require('../npm/npm-base')
const { versionColorForRange } = require('./node-version-color')

const keywords = ['npm']

module.exports = class NodeVersion extends NPMBase {
  static get category() {
    return 'platform-support'
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
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
        }),
        keywords,
      },
      {
        title: 'node (scoped)',
        pattern: '@:scope/:packageName',
        namedParams: { scope: 'stdlib', packageName: 'stdlib' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
        }),
        keywords,
      },
      {
        title: 'node (tag)',
        pattern: ':packageName/:tag',
        namedParams: { packageName: 'passport', tag: 'latest' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
      },
      {
        title: 'node (scoped with tag)',
        pattern: '@:scope/:packageName/:tag',
        namedParams: { scope: 'stdlib', packageName: 'stdlib', tag: 'latest' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
      },
      {
        title: 'node (scoped with tag, custom registry)',
        pattern: '@:scope/:packageName/:tag',
        namedParams: { scope: 'stdlib', packageName: 'stdlib', tag: 'latest' },
        queryParams: { registry_uri: 'https://registry.npmjs.com' },
        staticPreview: this.renderStaticPreview({
          nodeVersionRange: '>= 6.0.0',
          tag: 'latest',
        }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'node' }
  }

  static renderStaticPreview({ tag, nodeVersionRange }) {
    // Since this badge has an async `render()` function, but `get examples()` has to
    // be synchronous, this method exists. It should return the same value as the
    // real `render()`. There's a unit test to check that.
    return {
      label: tag ? `node@${tag}` : undefined,
      message: nodeVersionRange,
      color: 'brightgreen',
    }
  }

  static async render({ tag, nodeVersionRange }) {
    // Atypically, the `render()` function of this badge is `async` because it needs to pull
    // data from the server.
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
