'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')

module.exports = class Imagelayers extends LegacyService {
  static get category() {
    return 'size'
  }

  static get url() {
    return {
      base: 'imagelayers',
    }
  }

  static get examples() {
    return [
      {
        title: 'ImageLayers Size',
        previewUrl: 'image-size/_/ubuntu/latest',
      },
      {
        title: 'ImageLayers Layers',
        previewUrl: 'layers/_/ubuntu/latest',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/imagelayers\/(image-size|layers)\/([^/]+)\/([^/]+)\/([^/]*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1]
        let user = match[2]
        const repo = match[3]
        const tag = match[4]
        const format = match[5]
        if (user === '_') {
          user = 'library'
        }
        const path = user + '/' + repo
        const badgeData = getBadgeData(type, data)
        const options = {
          method: 'POST',
          json: true,
          body: {
            repos: [{ name: path, tag }],
          },
          uri: 'https://imagelayers.io/registry/analyze',
        }
        request(options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (type === 'image-size') {
              const size = metric(buffer[0].repo.size) + 'B'
              badgeData.text[0] = getLabel('image size', data)
              badgeData.text[1] = size
            } else if (type === 'layers') {
              badgeData.text[1] = buffer[0].repo.count
            }
            badgeData.colorscheme = null
            badgeData.colorB = '#007ec6'
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
