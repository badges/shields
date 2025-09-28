import { pathParams } from '../index.js'
import { renderDateBadge } from '../date.js'
import { BaseVaadinDirectoryService } from './vaadin-directory-base.js'

export default class VaadinDirectoryReleaseDate extends BaseVaadinDirectoryService {
  static category = 'activity'

  static route = {
    base: 'vaadin-directory',
    pattern: ':alias(rd|release-date)/:packageName',
  }

  static openApi = {
    '/vaadin-directory/release-date/{packageName}': {
      get: {
        summary: 'Vaadin Directory Release Date',
        parameters: pathParams({
          name: 'packageName',
          example: 'vaadinvaadin-grid',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'latest release date',
  }

  async handle({ alias, packageName }) {
    const data = await this.fetch({ packageName })
    return renderDateBadge(data.latestAvailableRelease.publicationDate)
  }
}
