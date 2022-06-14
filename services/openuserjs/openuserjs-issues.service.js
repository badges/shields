import { metric } from '../text-formatters.js'
import BaseOpenUserJSService from './openuserjs-base.js'

export default class OpenUserJSIssues extends BaseOpenUserJSService {
  static category = 'issue-tracking'
  static route = { base: 'openuserjs', pattern: 'issues/:username/:scriptname' }

  static examples = [
    {
      title: 'OpenUserJS',
      namedParams: {
        username: 'NatoBoram',
        scriptname: 'YouTube_Comment_Blacklist',
      },
      staticPreview: this.render({ issues: 0 }),
    },
  ]

  static defaultBadgeData = { label: 'issues' }

  static render({ issues }) {
    return {
      message: metric(issues),
      color: issues ? 'yellow' : 'brightgreen',
    }
  }

  async handle({ username, scriptname }) {
    const data = await this.fetch({ username, scriptname })
    return this.constructor.render({
      issues: data.OpenUserJS.issues[0].value,
    })
  }
}
