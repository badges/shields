'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class David extends LegacyService {
  static get category() {
    return 'dependencies'
  }

  static get url() {
    return {
      base: 'david',
    }
  }

  static get examples() {
    return [
      {
        title: 'David',
        previewUrl: 'expressjs/express',
      },
      {
        title: 'David',
        previewUrl: 'dev/expressjs/express',
      },
      {
        title: 'David',
        previewUrl: 'optional/elnounch/byebye',
      },
      {
        title: 'David',
        previewUrl: 'peer/webcomponents/generator-element',
      },
      {
        title: 'David (path)',
        previewUrl: 'babel/babel',
        query: { path: 'packages/babel-core' },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/david\/(dev\/|optional\/|peer\/)?(.+?)\.(svg|png|gif|jpg|json)$/,
      cache({
        queryParams: ['path'],
        handler: function(data, match, sendBadge, request) {
          let dev = match[1]
          if (dev != null) {
            dev = dev.slice(0, -1)
          } // 'dev', 'optional' or 'peer'.
          // eg, `expressjs/express`, `webcomponents/generator-element`.
          const userRepo = match[2]
          const format = match[3]
          let options = `https://david-dm.org/${userRepo}/${
            dev ? `${dev}-` : ''
          }info.json`
          if (data.path) {
            // path can be used to specify the package.json location, useful for monorepos
            options += `?path=${data.path}`
          }
          const badgeData = getBadgeData(
            `${dev ? `${dev} ` : ''}dependencies`,
            data
          )
          request(options, (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            } else if (res.statusCode === 500) {
              /* note:
        david returns a 500 response for 'not found'
        e.g: https://david-dm.org/foo/barbaz/info.json
        not a 404 so we can't handle 'not found' cleanly
        because this might also be some other error.
        */
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              let status = data.status
              if (status === 'insecure') {
                badgeData.colorscheme = 'red'
                status = 'insecure'
              } else if (status === 'notsouptodate') {
                badgeData.colorscheme = 'yellow'
                status = 'up to date'
              } else if (status === 'outofdate') {
                badgeData.colorscheme = 'red'
                status = 'out of date'
              } else if (status === 'uptodate') {
                badgeData.colorscheme = 'brightgreen'
                status = 'up to date'
              } else if (status === 'none') {
                badgeData.colorscheme = 'brightgreen'
              }
              badgeData.text[1] = status
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        },
      })
    )
  }
}
