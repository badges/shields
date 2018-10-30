'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  setBadgeColor,
} = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { metric } = require('../../lib/text-formatters')

class DockerPopularity extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    // Docker Hub stars integration.
    camp.route(
      /^\/docker\/stars\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        let user = match[1] // eg, mashape
        const repo = match[2] // eg, kong
        const format = match[3]
        if (user === '_') {
          user = 'library'
        }
        const path = user + '/' + repo
        const url =
          'https://hub.docker.com/v2/repositories/' + path + '/stars/count/'
        const badgeData = getBadgeData('docker stars', data)
        request(url, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const stars = parseInt(buffer, 10)
            if (Number.isNaN(stars)) {
              throw Error('Unexpected response.')
            }
            badgeData.text[1] = metric(stars)
            setBadgeColor(badgeData, data.colorB || '066da5')
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )

    // Docker Hub pulls integration.
    camp.route(
      /^\/docker\/pulls\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        let user = match[1] // eg, mashape
        const repo = match[2] // eg, kong
        const format = match[3]
        if (user === '_') {
          user = 'library'
        }
        const path = user + '/' + repo
        const url = 'https://hub.docker.com/v2/repositories/' + path
        const badgeData = getBadgeData('docker pulls', data)
        request(url, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parseData = JSON.parse(buffer)
            const pulls = parseData.pull_count
            badgeData.text[1] = metric(pulls)
            setBadgeColor(badgeData, data.colorB || '066da5')
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

class DockerBuild extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'docker',
    }
  }

  static get examples() {
    return [
      {
        title: 'Docker Automated build',
        previewUrl: 'automated/jrottenberg/ffmpeg',
        keywords: ['docker', 'automated', 'build'],
      },
      {
        title: 'Docker Build Status',
        previewUrl: 'build/jrottenberg/ffmpeg',
        keywords: ['docker', 'build', 'status'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    // Docker Hub automated integration, most recent build's status (passed, pending, failed)
    camp.route(
      /^\/docker\/build\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        let user = match[1] // eg, jrottenberg
        const repo = match[2] // eg, ffmpeg
        const format = match[3]
        if (user === '_') {
          user = 'library'
        }
        const path = user + '/' + repo
        const url =
          'https://registry.hub.docker.com/v2/repositories/' +
          path +
          '/buildhistory'
        const badgeData = getBadgeData('docker build', data)
        request(url, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            const mostRecentStatus = parsedData.results[0].status
            if (mostRecentStatus === 10) {
              badgeData.text[1] = 'passing'
              badgeData.colorscheme = 'brightgreen'
            } else if (mostRecentStatus < 0) {
              badgeData.text[1] = 'failing'
              badgeData.colorscheme = 'red'
            } else {
              badgeData.text[1] = 'building'
              setBadgeColor(badgeData, data.colorB || '066da5')
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )

    // Docker Hub automated integration.
    camp.route(
      /^\/docker\/automated\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        let user = match[1] // eg, jrottenberg
        const repo = match[2] // eg, ffmpeg
        const format = match[3]
        if (user === '_') {
          user = 'library'
        }
        const path = user + '/' + repo
        const url = 'https://registry.hub.docker.com/v2/repositories/' + path
        const badgeData = getBadgeData('docker build', data)
        request(url, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            const isAutomated = parsedData.is_automated
            if (isAutomated) {
              badgeData.text[1] = 'automated'
              setBadgeColor(badgeData, data.colorB || '066da5')
            } else {
              badgeData.text[1] = 'manual'
              badgeData.colorscheme = 'yellow'
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

module.exports = [DockerPopularity, DockerBuild]
