import Joi from 'joi'
import dayjs from 'dayjs'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  total: nonNegativeInteger,
}).required()

const intervalMap = {
  dd: {
    startDate: endDate => endDate,
    interval: 'day',
  },
  dw: {
    // 6 days, since date range is inclusive,
    startDate: endDate => dayjs(endDate).subtract(6, 'days'),
    interval: 'week',
  },
  dm: {
    startDate: endDate => dayjs(endDate).subtract(30, 'days'),
    interval: 'month',
  },
  dt: {
    startDate: () => dayjs(0),
  },
}

export default class SourceforgeDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'sourceforge',
    pattern: ':interval(dd|dw|dm|dt)/:project/:folder*',
  }

  static openApi = {
    '/sourceforge/{interval}/{project}': {
      get: {
        summary: 'SourceForge Downloads',
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dm',
            description: 'Daily, Weekly, Monthly, or Total downloads',
            schema: { type: 'string', enum: this.getEnum('interval') },
          },
          { name: 'project', example: 'sevenzip' },
        ),
      },
    },
    '/sourceforge/{interval}/{project}/{folder}': {
      get: {
        summary: 'SourceForge Downloads (folder)',
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dm',
            description: 'Daily, Weekly, Monthly, or Total downloads',
            schema: { type: 'string', enum: this.getEnum('interval') },
          },
          { name: 'project', example: 'arianne' },
          { name: 'folder', example: 'stendhal' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'sourceforge' }

  static render({ downloads, interval }) {
    return renderDownloadsBadge({
      downloads,
      labelOverride: 'downloads',
      interval: intervalMap[interval].interval,
    })
  }

  async fetch({ interval, project, folder }) {
    const url = `https://sourceforge.net/projects/${project}/files/${
      folder ? `${folder}/` : ''
    }stats/json`
    // get yesterday since today is incomplete
    const endDate = dayjs().subtract(24, 'hours')
    const startDate = intervalMap[interval].startDate(endDate)
    const options = {
      searchParams: {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
      },
    }

    return this._requestJson({
      schema,
      url,
      options,
      httpErrors: {
        404: 'project not found',
      },
    })
  }

  async handle({ interval, project, folder }) {
    const { total: downloads } = await this.fetch({ interval, project, folder })
    return this.constructor.render({ interval, downloads })
  }
}
