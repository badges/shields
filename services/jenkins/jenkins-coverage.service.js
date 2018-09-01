'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')
const { checkErrorResponse } = require('../../lib/error-helper')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

// For Jenkins coverage (cobertura + jacoco).
module.exports = class JenkinsCoverage extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jenkins(?:-ci)?\/(c|j)\/(http(?:s)?)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1] // c - cobertura | j - jacoco
        const scheme = match[2] // http(s)
        const host = match[3] // example.org:8080
        const job = match[4] // folder/job
        const format = match[5]
        const options = {
          json: true,
          uri: `${scheme}://${host}/job/${job}/`,
        }

        if (job.indexOf('/') > -1) {
          options.uri = `${scheme}://${host}/${job}/`
        }

        switch (type) {
          case 'c':
            options.uri +=
              'lastBuild/cobertura/api/json?tree=results[elements[name,denominator,numerator,ratio]]'
            break
          case 'j':
            options.uri +=
              'lastBuild/jacoco/api/json?tree=instructionCoverage[covered,missed,percentage,total]'
            break
        }

        if (serverSecrets && serverSecrets.jenkins_user) {
          options.auth = {
            user: serverSecrets.jenkins_user,
            pass: serverSecrets.jenkins_pass,
          }
        }

        const badgeData = getBadgeData('coverage', data)
        request(options, (err, res, json) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }

          try {
            const coverageObject = json.instructionCoverage
            if (coverageObject === undefined) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            const coverage = coverageObject.percentage
            if (isNaN(coverage)) {
              badgeData.text[1] = 'unknown'
              sendBadge(format, badgeData)
              return
            }
            badgeData.text[1] = coverage.toFixed(0) + '%'
            badgeData.colorscheme = coveragePercentageColor(coverage)
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
