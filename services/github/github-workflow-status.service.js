import { BaseService } from '../index.js'

export default class DeprecatedGithubWorkflowStatus extends BaseService {
  static category = 'build'

  static route = {
    base: 'github/workflow/status',
    pattern: ':various+',
  }

  static openApi = {}

  static defaultBadgeData = { label: 'build' }

  async handle() {
    return {
      label: 'build',
      message: 'https://github.com/badges/shields/issues/8671',
      /*
      This is a 'special' deprecation because we are making a breaking change
      We've implemented it as a custom class instead of a normal
      deprecatedService so that we can include link.
      */
      link: ['https://github.com/badges/shields/issues/8671'],
      color: 'red',
    }
  }
}
