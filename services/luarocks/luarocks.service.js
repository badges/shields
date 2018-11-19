'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { omitv, addv: versionText } = require('../../lib/text-formatters')
const {
  parseVersion: luarocksParseVersion,
  compareVersionLists: luarocksCompareVersionLists,
} = require('./luarocks-version')

module.exports = class Luarocks extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'luarocks/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'LuaRocks',
        previewUrl: 'mpeterv/luacheck',
        keywords: ['lua'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/luarocks\/v\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, `leafo`.
        const moduleName = match[2] // eg, `lapis`.
        const format = match[4]
        const apiUrl = `https://luarocks.org/manifests/${user}/manifest.json`
        const badgeData = getBadgeData('luarocks', data)
        let version = match[3] // you can explicitly specify a version
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          let versions
          try {
            const moduleInfo = JSON.parse(buffer).repository[moduleName]
            versions = Object.keys(moduleInfo)
            if (version && versions.indexOf(version) === -1) {
              throw new Error('unknown version')
            }
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }
          if (!version) {
            if (versions.length === 1) {
              version = omitv(versions[0])
            } else {
              let latestVersionString, latestVersionList
              versions.forEach(versionString => {
                versionString = omitv(versionString) // remove leading 'v'
                const versionList = luarocksParseVersion(versionString)
                if (
                  !latestVersionList || // first iteration
                  luarocksCompareVersionLists(versionList, latestVersionList) >
                    0
                ) {
                  latestVersionString = versionString
                  latestVersionList = versionList
                }
              })
              version = latestVersionString
            }
          }
          let color
          switch (version.slice(0, 3).toLowerCase()) {
            case 'dev':
              color = 'yellow'
              break
            case 'scm':
            case 'cvs':
              color = 'orange'
              break
            default:
              color = 'brightgreen'
          }
          badgeData.text[1] = versionText(version)
          badgeData.colorscheme = color
          sendBadge(format, badgeData)
        })
      })
    )
  }
}
