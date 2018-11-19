'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const log = require('../../lib/log')

// Handle .org and .com.
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
    return [
      {
        title: 'Travis (.org)',
        previewUrl: 'rust-lang/rust',
        pattern: ':user/:repo',
        exampleUrl: 'rust-lang/rust',
      },
      {
        title: 'Travis (.org) branch',
        previewUrl: 'rust-lang/rust/master',
        pattern: ':user/:repo/:branch',
        exampleUrl: 'rust-lang/rust/master',
      },
      {
        title: 'Travis (.com)',
        previewUrl: 'com/ivandelabeldad/rackian-gateway',
        pattern: 'com/:user/:repo',
        exampleUrl: 'com/ivandelabeldad/rackian-gateway',
      },
      {
        title: 'Travis (.com) branch',
        previewUrl: 'com/ivandelabeldad/rackian-gateway/master',
        pattern: 'com/:user/:repo/:branch',
        exampleUrl: 'com/ivandelabeldad/rackian-gateway/master',
      },
    ]
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
