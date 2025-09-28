import { pathParam, queryParam } from '../index.js'
import { packageNameDescription } from '../npm/npm-base.js'
import NodeVersionBase from './node-base.js'
import { versionColorForRangeLts } from './node-version-color.js'

const description = `<p>This badge indicates whether the package supports <b>all</b> LTS node versions.</p>
<p>The node version support is retrieved from the <code>engines.node</code> section in package.json.</p>`

export default class NodeLtsVersion extends NodeVersionBase {
  static route = this.buildRoute('node/v-lts', { withTag: true })

  static openApi = {
    '/node/v-lts/{packageName}': {
      get: {
        summary: 'Node LTS',
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
    '/node/v-lts/{packageName}/{tag}': {
      get: {
        summary: 'Node LTS (with tag)',
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
    label: 'node-lts',
  }

  static type = 'lts'

  static colorResolver = versionColorForRangeLts
}
