'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class JenkinsBuild extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'jenkins/s',
      pattern: ':scheme(http|https)?/:host/:job*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins',
        pattern: ':scheme/:host/:job',
        namedParams: {
          scheme: 'https',
          host: 'jenkins.qa.ubuntu.com',
          job:
            'view/Precise/view/All%20Precise/job/precise-desktop-amd64_default',
        },
        staticPreview: {
          label: 'build',
          message: 'passing',
          color: 'brightgreen',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jenkins(?:-ci)?\/s\/(http(?:s)?)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const scheme = match[1] // http(s)
        const host = match[2] // example.org:8080
        const job = match[3] // folder/job
        const format = match[4]
        const options = {
          json: true,
          uri: `${scheme}://${host}/job/${job}/api/json?tree=color`,
        }
        if (job.indexOf('/') > -1) {
          options.uri = `${scheme}://${host}/${job}/api/json?tree=color`
        }

        if (serverSecrets.jenkins_user) {
          options.auth = {
            user: serverSecrets.jenkins_user,
            pass: serverSecrets.jenkins_pass,
          }
        }

        const badgeData = getBadgeData('build', data)
        request(options, (err, res, json) => {
          if (err !== null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          try {
            if (json.color === 'blue' || json.color === 'green') {
              badgeData.colorscheme = 'brightgreen'
              badgeData.text[1] = 'passing'
            } else if (json.color === 'red') {
              badgeData.colorscheme = 'red'
              badgeData.text[1] = 'failing'
            } else if (json.color === 'yellow') {
              badgeData.colorscheme = 'yellow'
              badgeData.text[1] = 'unstable'
            } else if (
              json.color === 'grey' ||
              json.color === 'disabled' ||
              json.color === 'aborted' ||
              json.color === 'notbuilt'
            ) {
              badgeData.colorscheme = 'lightgrey'
              badgeData.text[1] = 'not built'
            } else {
              badgeData.colorscheme = 'lightgrey'
              badgeData.text[1] = 'building'
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
