import { renderDownloadsBadge } from '../downloads.js'
import BaseOpenUserJSService from './openuserjs-base.js'

export default class OpenUserJSDownloads extends BaseOpenUserJSService {
  static category = 'downloads'
  static route = { base: 'openuserjs', pattern: 'dt/:username/:scriptname' }

  static examples = [
    {
      title: 'OpenUserJS',
      namedParams: {
        username: 'NatoBoram',
        scriptname: 'YouTube_Comment_Blacklist',
      },
      staticPreview: renderDownloadsBadge({ downloads: 47 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ username, scriptname }) {
    const data = await this.fetch({ username, scriptname })
    return renderDownloadsBadge({
      downloads: data.OpenUserJS.installs[0].value,
    })
  }
}
