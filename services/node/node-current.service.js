import NodeVersionBase from './node-base.js'
import { versionColorForRangeCurrent } from './node-version-color.js'

export default class NodeCurrentVersion extends NodeVersionBase {
  static route = this.buildRoute('node/v', { withTag: true })

  static defaultBadgeData = {
    label: 'node',
  }

  static type = 'current'

  static colorResolver = versionColorForRangeCurrent

  static documentation = `This badge indicates whether the package supports the <b>latest</b> release of node`
}
