import { pathParams } from '../index.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
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

  static render({ date }) {
    return { message: formatDate(date), color: ageColor(date) }
  }

  async handle({ alias, packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({
      date: data.latestAvailableRelease.publicationDate,
    })
  }
}
