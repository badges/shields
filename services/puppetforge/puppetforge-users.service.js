'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')

class PuppetforgeUserReleases extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'puppetforge/rc',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge',
        previewUrl: 'camptocamp',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class PuppetforgeUserModules extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'puppetforge/mc',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge',
        previewUrl: 'camptocamp',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class PuppetforgeUsers extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/puppetforge\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // either `rc` or `mc`
        const user = match[2]
        const format = match[3]
        const options = {
          json: true,
          uri: `https://forgeapi.puppetlabs.com/v3/users/${user}`,
        }
        const badgeData = getBadgeData('puppetforge', data)
        request(options, (err, res, json) => {
          if (err != null || (json.length !== undefined && json.length === 0)) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (info === 'rc') {
              const releases = json.release_count
              badgeData.colorscheme = floorCountColor(releases, 10, 50, 100)
              badgeData.text[0] = getLabel('releases', data)
              badgeData.text[1] = metric(releases)
            } else if (info === 'mc') {
              const modules = json.module_count
              badgeData.colorscheme = floorCountColor(modules, 5, 10, 50)
              badgeData.text[0] = getLabel('modules', data)
              badgeData.text[1] = metric(modules)
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

module.exports = {
  PuppetforgeUserReleases,
  PuppetforgeUserModules,
  PuppetforgeUsers,
}
