'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { makeLogo: getLogo } = require('../../lib/logos')
const { metric } = require('../../lib/text-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
class TwitterUrl extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'twitter/url',
      pattern: ':protocol(https|http)/:hostAndPath+',
    }
  }

  static get examples() {
    return [
      {
        title: 'Twitter URL',
        pattern: ':protocol(https|http)/:hostAndPath',
        namedParams: {
          protocol: 'http',
          hostAndPath: 'shields.io',
        },
        queryParams: { style: 'social' },
        staticPreview: {
          label: 'Tweet',
          message: '',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'twitter',
    }
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
        badgeData.colorscheme = undefined
        badgeData.colorB = data.colorB || '#55ACEE'
        sendBadge(format, badgeData)
      })
    )
  }
}

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
class TwitterFollow extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'twitter/follow',
      pattern: ':user',
    }
  }

  static get examples() {
    return [
      {
        title: 'Twitter Follow',
        namedParams: {
          user: 'espadrine',
        },
        queryParams: { label: 'Follow' },
        staticPreview: {
          label: 'Follow',
          message: '393',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'twitter',
    }
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

        badgeData.colorscheme = undefined
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
