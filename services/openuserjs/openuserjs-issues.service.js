import { metric } from '../text-formatters.js'
import BaseOpenUserJSService from './openuserjs-base.js'

class OpenUserJSIssues extends BaseOpenUserJSService {
  static category = 'issue-tracking'
  static route = { base: 'openuserjs/issues', pattern: ':author/:scriptName' }

  static examples = [
    {
      title: 'OpenUserJS',
      namedParams: {
        author: 'NatoBoram',
        scriptName: 'YouTube_Comment_Blacklist',
      },
      staticPreview: this.render({ issues: 0 }),
    },
  ]

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'issues' }

  static render({ issues }) {
    return {
      message: metric(issues),
      color: issues ? 'yellow' : 'brightgreen',
    }
  }

  async handle({ author, scriptName }) {
    const data = await this.fetch({ author, scriptName })
    return this.constructor.render({
      issues: data.OpenUserJS.issues[0].value,
    })
  }
}

export { OpenUserJSIssues }
