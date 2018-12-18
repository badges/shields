'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const log = require('../../lib/log')

// Handle .org and .com.
//
// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class TravisBuild extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'travis',
    }
  }

  static get examples() {
    const { staticExample } = this
    return [
      {
        title: 'Travis (.org)',
        pattern: ':user/:repo',
        namedParams: { user: 'rust-lang', repo: 'rust' },
        staticExample,
      },
      {
        title: 'Travis (.org) branch',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'rust-lang', repo: 'rust', branch: 'master' },
        staticExample,
      },
      {
        title: 'Travis (.com)',
        pattern: 'com/:user/:repo',
        namedParams: { user: 'ivandelabeldad', repo: 'rackian-gateway' },
        staticExample,
      },
      {
        title: 'Travis (.com) branch',
        pattern: 'com/:user/:repo/:branch',
        namedParams: {
          user: 'ivandelabeldad',
          repo: 'rackian-gateway',
          branch: 'master',
        },
        staticExample,
      },
    ]
  }

  static get staticExample() {
    return { message: 'passing', color: 'brightgreen' }
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/travis(-ci)?\/(?:(com)\/)?(?!php-v)([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const travisDomain = match[2] || 'org' // (com | org) org by default
        const userRepo = match[3] // eg, espadrine/sc
        const branch = match[4]
        const format = match[5]
        const options = {
          method: 'HEAD',
          uri: `https://api.travis-ci.${travisDomain}/${userRepo}.svg`,
        }
        if (branch != null) {
          options.uri += `?branch=${branch}`
        }
        const badgeData = getBadgeData('build', data)
        request(options, (err, res) => {
          if (err != null) {
            log.error(
              `Travis error: data:${JSON.stringify(data)}\nStack: ${err.stack}`
            )
            if (res) {
              log.error(`${res}`)
            }
          }
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const state = res.headers['content-disposition'].match(
              /filename="(.+)\.svg"/
            )[1]
            badgeData.text[1] = state
            if (state === 'passing') {
              badgeData.colorscheme = 'brightgreen'
            } else if (state === 'failing') {
              badgeData.colorscheme = 'red'
            } else {
              badgeData.text[1] = state
            }
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
