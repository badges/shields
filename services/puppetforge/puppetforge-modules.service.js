'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric, addv: versionText } = require('../../lib/text-formatters')
const {
  version: versionColor,
  coveragePercentage: coveragePercentageColor,
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

class PuppetforgeModuleVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'puppetforge/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge',
        previewUrl: 'vStone/percona',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class PuppetforgeModuleDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'puppetforge/dt',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge',
        previewUrl: 'camptocamp/openldap',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class PuppetforgeModuleEndorsement extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'puppetforge/e',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge',
        previewUrl: 'camptocamp/openssl',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class PuppetforgeModuleFeedback extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'puppetforge/f',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge',
        previewUrl: 'camptocamp/openssl',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class PuppetforgeModules extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/puppetforge\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // either `v`, `dt`, `e` or `f`
        const user = match[2]
        const module = match[3]
        const format = match[4]
        const options = {
          json: true,
          uri: `https://forgeapi.puppetlabs.com/v3/modules/${user}-${module}`,
        }
        const badgeData = getBadgeData('puppetforge', data)
        request(options, (err, res, json) => {
          if (err != null || (json.length !== undefined && json.length === 0)) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (info === 'v') {
              if (json.current_release) {
                const version = json.current_release.version
                badgeData.text[1] = versionText(version)
                badgeData.colorscheme = versionColor(version)
              } else {
                badgeData.text[1] = 'none'
                badgeData.colorscheme = 'lightgrey'
              }
            } else if (info === 'dt') {
              const total = json.downloads
              badgeData.colorscheme = downloadCountColor(total)
              badgeData.text[0] = getLabel('downloads', data)
              badgeData.text[1] = metric(total)
            } else if (info === 'e') {
              const endorsement = json.endorsement
              if (endorsement === 'approved') {
                badgeData.colorscheme = 'green'
              } else if (endorsement === 'supported') {
                badgeData.colorscheme = 'brightgreen'
              } else {
                badgeData.colorscheme = 'red'
              }
              badgeData.text[0] = getLabel('endorsement', data)
              if (endorsement != null) {
                badgeData.text[1] = endorsement
              } else {
                badgeData.text[1] = 'none'
              }
            } else if (info === 'f') {
              const feedback = json.feedback_score
              badgeData.text[0] = getLabel('score', data)
              if (feedback != null) {
                badgeData.text[1] = `${feedback}%`
                badgeData.colorscheme = coveragePercentageColor(feedback)
              } else {
                badgeData.text[1] = 'unknown'
                badgeData.colorscheme = 'lightgrey'
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

module.exports = {
  PuppetforgeModuleVersion,
  PuppetforgeModuleDownloads,
  PuppetforgeModuleFeedback,
  PuppetforgeModuleEndorsement,
  PuppetforgeModules,
}
