import queryString from 'query-string'
import { fetch } from '../../../core/base-service/got.js'
import log from '../../../core/server/log.js'

function setRoutes({ server, authHelper, onTokenAccepted }) {
  const baseUrl = process.env.GATSBY_BASE_URL || 'https://img.shields.io'

  server.route(/^\/github-auth$/, (data, match, end, ask) => {
    ask.res.statusCode = 302 // Found.
    const query = queryString.stringify({
      // TODO The `_user` property bypasses security checks in AuthHelper.
      // (e.g: enforceStrictSsl and shouldAuthenticateRequest).
      // Do not use it elsewhere. It would be better to clean this up so
      // it's not setting a bad example.
      client_id: authHelper._user,
      redirect_uri: `${baseUrl}/github-auth/done`,
    })
    ask.res.setHeader(
      'Location',
      `https://github.com/login/oauth/authorize?${query}`
    )
    end('')
  })

  server.route(/^\/github-auth\/done$/, async (data, match, end, ask) => {
    if (!data.code) {
      log.log(`GitHub OAuth data: ${JSON.stringify(data)}`)
      return end('GitHub OAuth authentication failed to provide a code.')
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      form: {
        // TODO The `_user` and `_pass` properties bypass security checks in
        // AuthHelper (e.g: enforceStrictSsl and shouldAuthenticateRequest).
        // Do not use them elsewhere. It would be better to clean
        // this up so it's not setting a bad example.
        client_id: authHelper._user,
        client_secret: authHelper._pass,
        code: data.code,
      },
    }

    let resp
    try {
      resp = await fetch('https://github.com/login/oauth/access_token', options)
    } catch (e) {
      return end('The connection to GitHub failed.')
    }

    let content
    try {
      content = queryString.parse(resp.buffer)
    } catch (e) {
      return end('The GitHub OAuth token could not be parsed.')
    }

    const { access_token: token } = content
    if (!token) {
      return end('The GitHub OAuth process did not return a user token.')
    }

    ask.res.setHeader('Content-Type', 'text/html')
    end(
      '<p>Shields.io has received your app-specific GitHub user token. ' +
        'You can revoke it by going to ' +
        '<a href="https://github.com/settings/applications">GitHub</a>.</p>' +
        '<p>Until you do, you have now increased the rate limit for GitHub ' +
        'requests going through Shields.io. GitHub-related badges are ' +
        'therefore more robust.</p>' +
        '<p>Thanks for contributing to a smoother experience for ' +
        'everyone!</p>' +
        '<p><a href="/">Back to the website</a></p>'
    )

    onTokenAccepted(token)
  })
}

export { setRoutes }
