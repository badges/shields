'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class LibrariesioDependencies extends LegacyService {
  static get category() {
    return 'dependencies'
  }

  static get route() {
    return {
      base: 'librariesio',
      pattern: '',
    }
  }

  static get examples() {
    return [
      {
        title: 'Libraries.io dependency status for latest release',
        pattern: 'release/:user/:repo',
        namedParams: {
          user: 'hex',
          repo: 'phoenix',
        },
        staticPreview: {
          label: 'dependencies',
          message: '1 out of date',
          color: 'orange',
        },
      },
      {
        title: 'Libraries.io dependency status for specific release',
        pattern: 'release/:user/:repo/:version',
        namedParams: {
          user: 'hex',
          repo: 'phoenix',
          version: '1.0.3',
        },
        staticPreview: {
          label: 'dependencies',
          message: '3 out of date',
          color: 'orange',
        },
      },
      {
        title: 'Libraries.io dependency status for GitHub repo',
        pattern: 'github/:user/:repo',
        namedParams: {
          user: 'phoenixframework',
          repo: 'phoenix',
        },
        staticPreview: {
          label: 'dependencies',
          message: '325 out of date',
          color: 'orange',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/librariesio\/(github|release)\/([\w\-_]+\/[\w\-_.]+)\/?([\w\-_.]+)?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const resource = match[1]
        const project = match[2]
        const version = match[3]
        const format = match[4]

        let uri
        switch (resource) {
          case 'github': {
            uri = `https://libraries.io/api/github/${project}/dependencies`
            break
          }
          case 'release': {
            const v = version || 'latest'
            uri = `https://libraries.io/api/${project}/${v}/dependencies`
            break
          }
        }

        const options = { method: 'GET', json: true, uri }
        const badgeData = getBadgeData('dependencies', data)

        request(options, (err, res, json) => {
          if (
            checkErrorResponse(badgeData, err, res, { 404: 'not available' })
          ) {
            sendBadge(format, badgeData)
            return
          }

          try {
            const deprecated = json.dependencies.filter(dep => dep.deprecated)

            const outofdate = json.dependencies.filter(dep => dep.outdated)

            // Deprecated dependencies are really bad
            if (deprecated.length > 0) {
              badgeData.colorscheme = 'red'
              badgeData.text[1] = `${deprecated.length} deprecated`
              return sendBadge(format, badgeData)
            }

            // Out of date dependencies are pretty bad
            if (outofdate.length > 0) {
              badgeData.colorscheme = 'orange'
              badgeData.text[1] = `${outofdate.length} out of date`
              return sendBadge(format, badgeData)
            }

            // Up to date dependencies are good!
            badgeData.colorscheme = 'brightgreen'
            badgeData.text[1] = 'up to date'
            return sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
