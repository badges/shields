'use strict'

const Joi = require('joi')

const { BaseJsonService } = require('../base')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const { ordinalNumber } = require('../../lib/text-formatters')

module.exports = class GemRank extends BaseJsonService {
  _getApiUrl(repo, totalRank, dailyRank) {
    let endpoint
    if (totalRank) {
      endpoint = '/total_ranking.json'
    } else if (dailyRank) {
      endpoint = '/daily_ranking.json'
    }
    return `http://bestgems.org/api/v1/gems/${repo}${endpoint}`
  }

  async handle({ info, repo }) {
    const totalRank = info === 'rt'
    const dailyRank = info === 'rd'
    const url = this._getApiUrl(repo, totalRank, dailyRank)
    const json = await this._requestJson({
      url,
      schema: Joi.array(),
    })

    let rank
    if (totalRank) {
      rank = json[0].total_ranking
    } else if (dailyRank) {
      rank = json[0].daily_ranking
    }
    const count = Math.floor(100000 / rank)
    let message = ordinalNumber(rank)
    message += totalRank ? '' : ' daily'

    return {
      message: message,
      color: floorCountColor(count, 10, 50, 100),
    }
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'rank' }
  }

  static get category() {
    return 'rating'
  }

  static get url() {
    return {
      base: 'gem',
      format: '(rt|rd)/(.+)',
      capture: ['info', 'repo'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Gems',
        previewUrl: 'rt/puppet',
        keywords: ['ruby'],
      },
      {
        title: 'Gems',
        previewUrl: 'rd/facter',
        keywords: ['ruby'],
      },
    ]
  }
}
