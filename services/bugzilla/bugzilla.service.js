'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

const documentation = `
<p>
  If your Bugzilla badge errors, it might be because you are trying to load a private bug.
</p>
`

module.exports = class Bugzilla extends LegacyService {
  static get category() {
    return 'issue-tracking'
  }

  static get url() {
    return {
      base: 'bugzilla',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bugzilla bug status',
        previewUrl: '996038',
        keywords: ['Bugzilla', 'bug'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bugzilla\/(\d+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const bugNumber = match[1] // eg, 1436739
        const format = match[2]
        const options = {
          method: 'GET',
          json: true,
          uri: `https://bugzilla.mozilla.org/rest/bug/${bugNumber}`,
        }
        const badgeData = getBadgeData(`bug ${bugNumber}`, data)
        request(options, (err, res, json) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const bug = json.bugs[0]

            switch (bug.status) {
              case 'UNCONFIRMED':
                badgeData.text[1] = 'unconfirmed'
                badgeData.colorscheme = 'blue'
                break
              case 'NEW':
                badgeData.text[1] = 'new'
                badgeData.colorscheme = 'blue'
                break
              case 'ASSIGNED':
                badgeData.text[1] = 'assigned'
                badgeData.colorscheme = 'green'
                break
              case 'RESOLVED':
                if (bug.resolution === 'FIXED') {
                  badgeData.text[1] = 'fixed'
                  badgeData.colorscheme = 'brightgreen'
                } else if (bug.resolution === 'INVALID') {
                  badgeData.text[1] = 'invalid'
                  badgeData.colorscheme = 'yellow'
                } else if (bug.resolution === 'WONTFIX') {
                  badgeData.text[1] = "won't fix"
                  badgeData.colorscheme = 'orange'
                } else if (bug.resolution === 'DUPLICATE') {
                  badgeData.text[1] = 'duplicate'
                  badgeData.colorscheme = 'lightgrey'
                } else if (bug.resolution === 'WORKSFORME') {
                  badgeData.text[1] = 'works for me'
                  badgeData.colorscheme = 'yellowgreen'
                } else if (bug.resolution === 'INCOMPLETE') {
                  badgeData.text[1] = 'incomplete'
                  badgeData.colorscheme = 'red'
                } else {
                  badgeData.text[1] = 'unknown'
                }
                break
              default:
                badgeData.text[1] = 'unknown'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'unknown'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
