'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')

module.exports = class JenkinsTests extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'jenkins/t',
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins tests',
        previewUrl:
          'https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jenkins(?:-ci)?\/t\/(http(?:s)?)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const scheme = match[1] // http(s)
        const host = match[2] // example.org:8080
        const job = match[3] // folder/job
        const format = match[4]
        const options = {
          json: true,
          uri: `${scheme}://${host}/job/${job}/lastBuild/api/json?tree=${encodeURIComponent(
            'actions[failCount,skipCount,totalCount]'
          )}`,
        }
        if (job.indexOf('/') > -1) {
          options.uri = `${scheme}://${host}/${job}/lastBuild/api/json?tree=${encodeURIComponent(
            'actions[failCount,skipCount,totalCount]'
          )}`
        }

        if (serverSecrets && serverSecrets.jenkins_user) {
          options.auth = {
            user: serverSecrets.jenkins_user,
            pass: serverSecrets.jenkins_pass,
          }
        }

        const badgeData = getBadgeData('tests', data)
        request(options, (err, res, json) => {
          if (err !== null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          try {
            const testsObject = json.actions.filter(obj =>
              obj.hasOwnProperty('failCount')
            )[0]
            if (testsObject === undefined) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            const successfulTests =
              testsObject.totalCount -
              (testsObject.failCount + testsObject.skipCount)
            const percent = successfulTests / testsObject.totalCount
            badgeData.text[1] = `${successfulTests} / ${testsObject.totalCount}`
            if (percent === 1) {
              badgeData.colorscheme = 'brightgreen'
            } else if (percent === 0) {
              badgeData.colorscheme = 'red'
            } else {
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
