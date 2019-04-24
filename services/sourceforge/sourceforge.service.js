'use strict'

const Joi = require('joi')
const moment = require('moment')
const { BaseJsonService } = require('..')
const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  total: nonNegativeInteger,
}).required()

const intervalMap = {
  dd: {
    startDate: endDate => endDate,
    suffix: '/day',
  },
  dw: {
    // 6 days, since date range is inclusive,
    startDate: endDate => moment(endDate).subtract(6, 'days'),
    suffix: '/week',
  },
  dm: {
    startDate: endDate => moment(endDate).subtract(30, 'days'),
    suffix: '/month',
  },
  dt: {
    startDate: () => moment(0),
    suffix: '',
  },
}

module.exports = class Sourceforge extends BaseJsonService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'sourceforge',
      pattern: ':interval(dt|dm|dw|dd)/:project/:folder?',
    }
  }

  static get examples() {
    return [
      {
        title: 'SourceForge',
        pattern: ':interval(dt|dm|dw|dd)/:project',
        namedParams: {
          interval: 'dm',
          project: 'sevenzip',
        },
        staticPreview: this.render({
          downloads: 215990,
          interval: 'dm',
        }),
      },
      {
        title: 'SourceForge',
        pattern: ':interval(dt|dm|dw|dd)/:project/:folder',
        namedParams: {
          interval: 'dm',
          project: 'arianne',
          folder: 'stendhal',
        },
        staticPreview: this.render({
          downloads: 550,
          interval: 'dm',
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'sourceforge' }
  }

  static render({ downloads, interval }) {
    return {
      label: 'downloads',
      message: `${metric(downloads)}${intervalMap[interval].suffix}`,
      color: downloadCount(downloads),
    }
  }

  async fetch({ interval, project, folder }) {
    const url = `http://sourceforge.net/projects/${project}/files/${
      folder ? `${folder}/` : ''
    }stats/json`
    // get yesterday since today is incomplete
    const endDate = moment().subtract(24, 'hours')
    const startDate = intervalMap[interval].startDate(endDate)
    const options = {
      qs: {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
      },
    }

    return this._requestJson({
      schema,
      url,
      options,
      errorMessages: {
        404: 'project not found',
      },
    })
  }

  async handle({ interval, project, folder }) {
    const json = await this.fetch({ interval, project, folder })
    return this.constructor.render({ interval, downloads: json.total })
  }
}
