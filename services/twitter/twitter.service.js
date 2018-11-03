'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')

class TwitterUrl extends LegacyService {
  static get category() {
    return 'social'
  }

  static get url() {
    return {
      base: 'twitter/url',
    }
  }

  static get examples() {
    return [
      {
        title: 'Twitter URL',
        previewUrl: 'http/shields.io',
        query: { style: 'social' },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/twitter\/url\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const scheme = match[1] // eg, https
        const path = match[2] // eg, shields.io
        const format = match[3]
        const page = encodeURIComponent(`${scheme}://${path}`)
        // The URL API died: #568.
        //var url = 'http://cdn.api.twitter.com/1/urls/count.json?url=' + page;
        const badgeData = getBadgeData('tweet', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('twitter', data)
          badgeData.links = [
            `https://twitter.com/intent/tweet?text=Wow:&url=${page}`,
            `https://twitter.com/search?q=${page}`,
          ]
        }
        badgeData.text[1] = ''
        badgeData.colorscheme = null
        badgeData.colorB = data.colorB || '#55ACEE'
        sendBadge(format, badgeData)
      })
    )
  }
}

class TwitterFollow extends LegacyService {
  static get category() {
    return 'social'
  }

  static get url() {
    return {
      base: 'twitter/follow',
    }
  }

  static get examples() {
    return [
      {
        title: 'Twitter Follow',
        previewUrl: 'espadrine',
        query: { style: 'social', label: 'Follow' },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/twitter\/follow\/@?([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, shields_io
        const format = match[2]
        const options = {
          url: `http://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${user}`,
        }
        const badgeData = getBadgeData(`follow @${user}`, data)

        badgeData.colorscheme = null
        badgeData.colorB = '#55ACEE'
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('twitter', data)
        }
        badgeData.links = [
          `https://twitter.com/intent/follow?screen_name=${user}`,
          `https://twitter.com/${user}/followers`,
        ]
        badgeData.text[1] = ''
        request(options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            // The data is formatted as an array.
            const data = JSON.parse(buffer)[0]
            if (data === undefined) {
              badgeData.text[1] = 'invalid user'
            } else if (data.followers_count != null) {
              // data.followers_count could be zero… don't just check if falsey.
              badgeData.text[1] = metric(data.followers_count)
            }
          } catch (e) {
            badgeData.text[1] = 'invalid'
          }
          sendBadge(format, badgeData)
        })
      })
    )
  }
}

module.exports = [TwitterUrl, TwitterFollow]
