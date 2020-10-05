'use strict'

const NodeVersionBase = require('./node-base')
const { versionColorForRangeLts } = require('./node-version-color')

module.exports = class NodeLtsVersion extends NodeVersionBase {
  static route = this.buildRoute('node/v-lts', { withTag: true })

  static defaultBadgeData = {
    label: 'node-lts',
  }

  static type = 'lts'

  static colorResolver = versionColorForRangeLts

  static documentation = `This badge indicates whether the package supports <b>all</b> LTS node versions`
}
