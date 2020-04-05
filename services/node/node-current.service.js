'use strict'

const NodeVersionBase = require('./node-base')
const { versionColorForRangeCurrent } = require('./node-version-color')

module.exports = class NodeCurrentVersion extends NodeVersionBase {
  static get path() {
    return 'v'
  }

  static get defaultBadgeData() {
    return { label: 'node' }
  }

  static get type() {
    return 'current'
  }

  static get colorResolver() {
    return versionColorForRangeCurrent
  }

  static get documentation() {
    return `The badge will be green if the selected package release supports the current (latest) node version`
  }
}
