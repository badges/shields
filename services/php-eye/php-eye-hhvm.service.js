'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { omitv } = require('../text-formatters')

const keywords = ['php', 'runtime']

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class PhpeyeHhvm extends LegacyService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'hhvm',
      pattern: '',
    }
  }

  static get examples() {
    return [
      {
        title: 'HHVM',
        pattern: ':user/:packageName',
        namedParams: { user: 'symfony', packageName: 'symfony' },
        staticPreview: {
          label: 'hhvm',
          message: 'not tested',
          color: 'red',
        },
        keywords,
      },
      {
        title: 'HHVM (branch)',
        pattern: ':user/:packageName/:branch',
        namedParams: {
          user: 'symfony',
          packageName: 'symfony',
          branch: 'master',
        },
        staticPreview: {
          label: 'hhvm',
          message: 'not tested',
          color: 'red',
        },
        keywords,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/hhvm\/([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, `symfony/symfony`.
        let branch = match[2] ? omitv(match[2]) : 'dev-master'
        const format = match[3]
        const apiUrl = `https://php-eye.com/api/v1/package/${user}.json`
        const badgeData = getBadgeData('hhvm', data)
        if (branch === 'master') {
          branch = 'dev-master'
        }
        request(apiUrl, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            let verInfo = {}
            if (!data.versions) {
              throw Error('Unexpected response.')
            }
            badgeData.text[1] = 'branch not found'
            for (let i = 0, count = data.versions.length; i < count; i++) {
              verInfo = data.versions[i]
              if (verInfo.name === branch) {
                if (!verInfo.travis.runtime_status) {
                  throw Error('Unexpected response.')
                }
                switch (verInfo.travis.runtime_status.hhvm) {
                  case 3:
                    // tested`
                    badgeData.colorscheme = 'brightgreen'
                    badgeData.text[1] = 'tested'
                    break
                  case 2:
                    // allowed failure
                    badgeData.colorscheme = 'yellow'
                    badgeData.text[1] = 'partially tested'
                    break
                  case 1:
                    // not tested
                    badgeData.colorscheme = 'red'
                    badgeData.text[1] = 'not tested'
                    break
                  case 0:
                    // unknown/no config file
                    badgeData.text[1] = 'maybe untested'
                    break
                }
                break
              }
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
