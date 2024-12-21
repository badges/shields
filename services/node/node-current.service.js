import { pathParam, queryParam } from '../index.js'
import { packageNameDescription } from '../npm/npm-base.js'
import NodeVersionBase from './node-base.js'
import { versionColorForRangeCurrent } from './node-version-color.js'

const description = `<p>This badge indicates whether the package supports the <b>latest</b> release of node.</p>
<p>The node version support is retrieved from the <code>engines.node</code> section in package.json.</p>`

export default class NodeCurrentVersion extends NodeVersionBase {
  static route = this.buildRoute('node/v', { withTag: true })

  static openApi = {
    '/node/v/{packageName}': {
      get: {
        summary: 'Node Current',
        description,
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'passport',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
    '/node/v/{packageName}/{tag}': {
      get: {
        summary: 'Node Current (with tag)',
        description,
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'passport',
            description: packageNameDescription,
          }),
          pathParam({
            name: 'tag',
            example: 'latest',
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'node',
  }

  static type = 'current'

  static colorResolver = versionColorForRangeCurrent
}
