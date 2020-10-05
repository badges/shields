'use strict'

const NodeVersionBase = require('./node-base')
const { versionColorForRangeCurrent } = require('./node-version-color')

module.exports = class NodeCurrentVersion extends NodeVersionBase {
  static route = this.buildRoute('node/v', { withTag: true })

  static defaultBadgeData = {
    label: 'node',
  }

  static type = 'current'

  static colorResolver = versionColorForRangeCurrent

  static documentation = `This badge indicates whether the package supports the <b>latest</b> release of node`
}
