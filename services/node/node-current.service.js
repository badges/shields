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
    return `This badge indicates whether the package supports the <b>latest</b> release of node`
  }
}
