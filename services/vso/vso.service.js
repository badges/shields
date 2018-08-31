'use strict'

const { fetchFromSvgAsPromise } = require('../../lib/svg-badge-parser')
const BaseHTTPService = require('../base-http')

const documentation = `
<p>
  To obtain your own badge, you will first need to enable badges for your
  project:
</p>
<img
  src="https://cloud.githubusercontent.com/assets/6189336/11894616/be744ab4-a578-11e5-9e44-0c32a7836b3b.png"
  alt="Go to your builds, click General, then check Badge enabled." />
<p>
  Then, click “Show url…” to reveal the URL of the default badge. In that URL,
  you will need to extract three pieces of information: <code>TEAM_NAME</code>,
  <code>PROJECT_ID</code> and <code>BUILD_DEFINITION_ID</code>.
</p>
<img
  src="https://cloud.githubusercontent.com/assets/6189336/11629345/f4eb0d78-9cf7-11e5-8d83-ca9fd895fcea.png"
  alt="TEAM_NAME is just after the https:// part, PROJECT_ID is after definitions/, BUILD_DEFINITION_ID is after that.">
<p>
  Your badge will then have the form
  <code>https://img.shields.io/vso/build/:team/:project/:buildDefinitionId.svg</code>.
</p>
`

// For Visual Studio Team Services build.
module.exports = class Vso extends BaseHTTPService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'vso/build',
      format: '([^/]+)/([^/]+)/([^/]+)',
      capture: [
        'team',
        'project', // Project ID, e.g. 953a34b9-5966-4923-a48a-c41874cfb5f5
        'buildDefinitionId', // Build definition ID, e.g. 1
      ],
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Team services',
        previewUrl: 'larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/1',
        documentation,
        keywords: ['vso'],
      },
    ]
  }

  static render({ status }) {
    if (status === 'succeeded') {
      return {
        message: 'passing',
        color: 'brightgreen',
      }
    } else if (status === 'failed') {
      return {
        message: 'failing',
        color: 'red',
      }
    } else {
      return { message: status.toLowerCase() }
    }
  }

  async handle({ team, project, buildDefinitionId }) {
    const status = await fetchFromSvgAsPromise(this, {
      url:
        `https://${team}.visualstudio.com` +
        '/DefaultCollection/_apis/public/build/definitions' +
        `/${project}/${buildDefinitionId}/badge`,
      errorMessages: {
        400: 'project not found',
        404: 'user or build not found',
      },
    })
    return this.constructor.render({ status })
  }
}
