import Joi from 'joi'
import dayjs from 'dayjs'
import { BaseJsonService, pathParam } from '../index.js'
import { parseDate } from '../date.js'

const schema = Joi.object({
  result: Joi.string().valid('passed', 'failed', 'error', 'none').required(),
  finishedAt: Joi.string().isoDate().allow(null).required(),
  restoreSeconds: Joi.number().allow(null).required(),
}).required()

// Drills are scheduled weekly, so a pass older than that means drills stopped running.
const freshPassDays = 8

export default class BackupDrillDrill extends BaseJsonService {
  static category = 'monitoring'

  static route = {
    base: 'backupdrill/drill',
    pattern: ':token',
  }

  static openApi = {
    '/backupdrill/drill/{token}': {
      get: {
        summary: 'BackupDrill restore drill',
        description:
          'Result of the latest restore drill for a BackupDrill project, from the [BackupDrill drill status API](https://backupdrill.com/docs/drill-status-api). The project owner turns on public drill status in the BackupDrill console and gets a link; the token is the last part of that link.',
        parameters: [
          pathParam({
            name: 'token',
            example: 'dLElUDv3iVpz3liB8axf-Q',
            description:
              'The token from the project’s public drill status link',
          }),
        ],
      },
    },
  }

  static _cacheLength = 300

  static defaultBadgeData = {
    label: 'restore drill',
  }

  static render({ result, finishedAt }) {
    if (result === 'none') {
      return { message: 'no drills yet', color: 'lightgrey' }
    }
    const finished = parseDate(finishedAt)
    const when = finished.fromNow()
    if (result === 'passed') {
      const fresh = dayjs().diff(finished, 'days') <= freshPassDays
      return {
        message: `passed ${when}`,
        color: fresh ? 'brightgreen' : 'yellow',
      }
    }
    if (result === 'failed') {
      return { message: `failed ${when}`, color: 'red' }
    }
    return { message: `did not finish ${when}`, color: 'orange' }
  }

  async fetch({ token }) {
    return this._requestJson({
      schema,
      url: `https://app.backupdrill.com/api/v1/drill-status/${encodeURIComponent(token)}`,
      httpErrors: { 404: 'not found' },
    })
  }

  async handle({ token }) {
    const { result, finishedAt } = await this.fetch({ token })
    return this.constructor.render({ result, finishedAt })
  }
}
