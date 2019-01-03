'use strict'

const prettyBytes = require('pretty-bytes')
const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class MicroBadger extends LegacyService {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'microbadger',
    }
  }

  static get examples() {
    return [
      {
        title: 'MicroBadger Size',
        pattern: 'image-size/:imageId+',
        namedParams: { imageId: 'fedora/apache' },
        staticPreview: {
          label: 'image size',
          message: '126 MB',
          color: 'blue',
        },
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Size (tag)',
        pattern: 'image-size/:imageId+/:tag',
        namedParams: { imageId: 'fedora/apache', tag: 'latest' },
        staticPreview: {
          label: 'image size',
          message: '103 MB',
          color: 'blue',
        },
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Layers',
        pattern: 'layers/:imageId+',
        namedParams: { imageId: '_/alpine' },
        staticPreview: { label: 'layers', message: '15', color: 'blue' },
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Layers (tag)',
        pattern: 'layers/:imageId+/:tag',
        namedParams: { imageId: '_/alpine', tag: '2.7' },
        staticPreview: { label: 'layers', message: '12', color: 'blue' },
        keywords: ['docker'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/microbadger\/(image-size|layers)\/([^/]+)\/([^/]+)\/?([^/]*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1]
        let user = match[2]
        const repo = match[3]
        const tag = match[4]
        const format = match[5]
        if (user === '_') {
          user = 'library'
        }
        const url = `https://api.microbadger.com/v1/images/${user}/${repo}`

        const badgeData = getBadgeData(type, data)
        if (type === 'image-size') {
          badgeData.text[0] = getLabel('image size', data)
        }

        const options = {
          method: 'GET',
          uri: url,
          headers: {
            Accept: 'application/json',
          },
        }
        request(options, (err, res, buffer) => {
          if (res && res.statusCode === 404) {
            badgeData.text[1] = 'not found'
            sendBadge(format, badgeData)
            return
          }

          if (err != null || !res || res.statusCode !== 200) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          try {
            const parsedData = JSON.parse(buffer)
            let image

            if (tag) {
              image =
                parsedData.Versions &&
                parsedData.Versions.find(v => v.Tags.some(t => t.tag === tag))
              if (!image) {
                badgeData.text[1] = 'not found'
                sendBadge(format, badgeData)
                return
              }
            } else {
              image = parsedData
            }

            if (type === 'image-size') {
              const downloadSize = image.DownloadSize
              if (downloadSize === undefined) {
                badgeData.text[1] = 'unknown'
                sendBadge(format, badgeData)
                return
              }
              badgeData.text[1] = prettyBytes(parseInt(downloadSize))
            } else if (type === 'layers') {
              badgeData.text[1] = image.LayerCount
            }
            badgeData.colorscheme = null
            badgeData.colorB = 'blue'
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.colorscheme = 'red'
            badgeData.text[1] = 'error'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
