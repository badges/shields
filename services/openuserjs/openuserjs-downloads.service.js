import { renderDownloadsBadge } from '../downloads.js'
import BaseOpenUserJSService from './openuserjs-base.js'

export default class OpenUserJSDownloads extends BaseOpenUserJSService {
  static category = 'downloads'
  static route = { base: 'openuserjs', pattern: 'dt/:author/:scriptName' }

  static examples = [
    {
      title: 'OpenUserJS',
      namedParams: {
        author: 'NatoBoram',
        scriptName: 'YouTube_Comment_Blacklist',
      },
      staticPreview: this.render({ downloads: 47 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  async handle({ author, scriptName }) {
    const data = await this.fetch({ author, scriptName })
    return this.constructor.render({
      downloads: data.OpenUserJS.installs[0].value,
    })
  }
}
