import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import { BaseVaadinDirectoryService } from './vaadin-directory-base.js'

export default class VaadinDirectoryReleaseDate extends BaseVaadinDirectoryService {
  static category = 'activity'

  static route = {
    base: 'vaadin-directory',
    pattern: ':alias(rd|release-date)/:packageName',
  }

  static examples = [
    {
      title: 'Vaadin Directory',
      pattern: 'release-date/:packageName',
      namedParams: { packageName: 'vaadinvaadin-grid' },
      staticPreview: this.render({ date: '2018-12-12' }),
      keywords: ['vaadin-directory', 'date', 'latest release date'],
    },
  ]

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
