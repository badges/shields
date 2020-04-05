'use strict'

const NodeVersionBase = require('./node-base')
const { versionColorForRangeLts } = require('./node-version-color')

module.exports = class NodeLtsVersion extends NodeVersionBase {
  static get path() {
    return 'v-lts'
  }

  static get defaultBadgeData() {
    return { label: 'node-lts' }
  }

  static get type() {
    return 'lts'
  }

  static get colorResolver() {
    return versionColorForRangeLts
  }

  static get documentation() {
    return `This badge acts as an indicator that the package is supported by <b>all</b> LTS node versions`
  }
}
