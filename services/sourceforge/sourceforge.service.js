'use strict'

const moment = require('moment')
const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Sourceforge extends LegacyService {
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
        pattern: 'dm/:project',
        namedParams: {
          project: 'sevenzip',
        },
        staticPreview: {
          label: 'downloads',
          message: '216k/month',
          color: 'brightgreen',
        },
      },
      {
        title: 'SourceForge',
        pattern: 'dw/:project',
        namedParams: {
          project: 'sevenzip',
        },
        staticPreview: {
          label: 'downloads',
          message: '52k/week',
          color: 'brightgreen',
        },
      },
      {
        title: 'SourceForge',
        pattern: 'dd/:project',
        namedParams: {
          project: 'sevenzip',
        },
        staticPreview: {
          label: 'downloads',
          message: '6k/day',
          color: 'brightgreen',
        },
      },
      {
        title: 'SourceForge',
        pattern: 'dt/:project',
        namedParams: {
          project: 'sevenzip',
        },
        staticPreview: {
          label: 'downloads',
          message: '416M',
          color: 'brightgreen',
        },
      },
      {
        title: 'SourceForge',
        pattern: 'dt/:project/:folder',
        namedParams: {
          project: 'arianne',
          folder: 'stendhal',
        },
        staticPreview: {
          label: 'downloads',
          message: '177k',
          color: 'brightgreen',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/sourceforge\/(dt|dm|dw|dd)\/([^/]*)\/?(.*).(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // eg, 'dm'
        const project = match[2] // eg, 'sevenzip`.
        const folder = match[3]
        const format = match[4]
        let apiUrl = `http://sourceforge.net/projects/${project}/files/${folder}/stats/json`
        const badgeData = getBadgeData('sourceforge', data)
        let timePeriod, startDate
        badgeData.text[0] = getLabel('downloads', data)
        // get yesterday since today is incomplete
        const endDate = moment().subtract(24, 'hours')
        switch (info.charAt(1)) {
          case 'm':
            startDate = moment(endDate).subtract(30, 'days')
            timePeriod = '/month'
            break
          case 'w':
            startDate = moment(endDate).subtract(6, 'days') // 6, since date range is inclusive
            timePeriod = '/week'
            break
          case 'd':
            startDate = endDate
            timePeriod = '/day'
            break
          case 't':
            startDate = moment(0)
            timePeriod = ''
            break
        }
        apiUrl += `?start_date=${startDate.format(
          'YYYY-MM-DD'
        )}&end_date=${endDate.format('YYYY-MM-DD')}`
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            const downloads = data.total
            badgeData.text[1] = metric(downloads) + timePeriod
            badgeData.colorscheme = downloadCountColor(downloads)
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
