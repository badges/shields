import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BaseVaadinDirectoryService } from './vaadin-directory-base.js'

export default class VaadinDirectoryVersion extends BaseVaadinDirectoryService {
  static category = 'version'

  static route = {
    base: 'vaadin-directory',
    pattern: ':alias(v|version)/:packageName',
  }

  static openApi = {
    '/vaadin-directory/v/{packageName}': {
      get: {
        summary: 'Vaadin Directory Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'vaadinvaadin-grid',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'vaadin directory',
  }

  async handle({ alias, packageName }) {
    const data = await this.fetch({ packageName })
    const lv = data.latestAvailableRelease.name.toLowerCase()
    return renderVersionBadge({ version: lv })
  }
}
