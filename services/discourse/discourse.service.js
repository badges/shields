'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Discourse extends LegacyService {
  static get category() {
    return 'chat'
  }

  static get route() {
    return {
      base: 'discourse',
      pattern:
        ':scheme(http|https)/:host/:which(topics|posts|users|likes|status)',
    }
  }

  static get examples() {
    return [
      {
        title: 'Discourse topics',
        pattern: ':scheme(http|https)/:host/topics',
        namedParams: {
          scheme: 'https',
          host: 'meta.discourse.org',
        },
        staticPreview: {
          label: 'discourse',
          message: '27k topics',
          color: 'brightgreen',
        },
      },
      {
        title: 'Discourse posts',
        pattern: ':scheme(http|https)/:host/posts',
        namedParams: {
          scheme: 'https',
          host: 'meta.discourse.org',
        },
        staticPreview: {
          label: 'discourse',
          message: '490k posts',
          color: 'brightgreen',
        },
      },
      {
        title: 'Discourse users',
        pattern: ':scheme(http|https)/:host/users',
        namedParams: {
          scheme: 'https',
          host: 'meta.discourse.org',
        },
        staticPreview: {
          label: 'discourse',
          message: '42k users',
          color: 'brightgreen',
        },
      },
      {
        title: 'Discourse likes',
        pattern: ':scheme(http|https)/:host/likes',
        namedParams: {
          scheme: 'https',
          host: 'meta.discourse.org',
        },
        staticPreview: {
          label: 'discourse',
          message: '499k likes',
          color: 'brightgreen',
        },
      },
      {
        title: 'Discourse status',
        pattern: ':scheme(http|https)/:host/status',
        namedParams: {
          scheme: 'https',
          host: 'meta.discourse.org',
        },
        staticPreview: {
          label: 'discourse',
          message: 'online',
          color: 'brightgreen',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/discourse\/(http(?:s)?)\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const scheme = match[1] // eg, https
        const host = match[2] // eg, meta.discourse.org
        const stat = match[3] // eg, user_count
        const format = match[4]
        const url = `${scheme}://${host}/site/statistics.json`

        const options = {
          method: 'GET',
          uri: url,
          headers: {
            Accept: 'application/json',
          },
        }

        const badgeData = getBadgeData('discourse', data)
        request(options, (err, res) => {
          if (err != null) {
            if (res) {
              console.error(`${res}`)
            }

            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          if (res.statusCode !== 200) {
            badgeData.text[1] = 'inaccessible'
            badgeData.colorscheme = 'red'
            sendBadge(format, badgeData)
            return
          }

          badgeData.colorscheme = 'brightgreen'

          try {
            const data = JSON.parse(res['body'])
            let statCount

            switch (stat) {
              case 'topics':
                statCount = data.topic_count
                badgeData.text[1] = `${metric(statCount)} topics`
                break
              case 'posts':
                statCount = data.post_count
                badgeData.text[1] = `${metric(statCount)} posts`
                break
              case 'users':
                statCount = data.user_count
                badgeData.text[1] = `${metric(statCount)} users`
                break
              case 'likes':
                statCount = data.like_count
                badgeData.text[1] = `${metric(statCount)} likes`
                break
              case 'status':
                badgeData.text[1] = 'online'
                break
              default:
                badgeData.text[1] = 'invalid'
                badgeData.colorscheme = 'yellow'
                break
            }

            sendBadge(format, badgeData)
          } catch (e) {
            console.error(`${e.stack}`)
            badgeData.colorscheme = 'yellow'
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
