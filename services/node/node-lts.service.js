'use strict'

const NodeVersionBase = require('./node-base')
const { versionColorForRangeLts } = require('./node-version-color')

module.exports = class NodeLtsVersion extends NodeVersionBase {
  static path = 'v-lts'

  static defaultBadgeData = {
    label: 'node-lts',
  }

  static type = 'lts'

  static colorResolver = versionColorForRangeLts

  static documentation = `This badge indicates whether the package supports <b>all</b> LTS node versions`
}
