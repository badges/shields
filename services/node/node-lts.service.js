import NodeVersionBase from './node-base.js'
import { versionColorForRangeLts } from './node-version-color.js'

export default class NodeLtsVersion extends NodeVersionBase {
  static route = this.buildRoute('node/v-lts', { withTag: true })

  static defaultBadgeData = {
    label: 'node-lts',
  }

  static type = 'lts'

  static colorResolver = versionColorForRangeLts

  static documentation = `This badge indicates whether the package supports <b>all</b> LTS node versions`
}
