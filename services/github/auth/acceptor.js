import queryString from 'query-string'
import multer from 'multer'
import { fetch } from '../../../core/base-service/got.js'
import log from '../../../core/server/log.js'

function setRoutes({ app, authHelper, onTokenAccepted }) {
  const baseUrl = process.env.GATSBY_BASE_URL || 'https://img.shields.io'

  app.post('/github-auth', (req, res) => {
    res.status(302) // Found.
    const query = queryString.stringify({
      // TODO The `_user` property bypasses security checks in AuthHelper.
      // (e.g: enforceStrictSsl and shouldAuthenticateRequest).
      // Do not use it elsewhere. It would be better to clean this up so
      // it's not setting a bad example.
      client_id: authHelper._user,
      redirect_uri: `${baseUrl}/github-auth/done`,
    })
    res.setHeader(
      'Location',
      `https://github.com/login/oauth/authorize?${query}`
    )
    res.end()
  })

  app.post('/github-auth/done', multer().none(), async (req, res) => {
    const code = (req.body ?? {}).code

    if (!code) {
      log.log(`GitHub OAuth data: ${JSON.stringify(req.body)}`)
      res.send('GitHub OAuth authentication failed to provide a code.')
      res.end()
      return
    }

    let resp
    try {
      resp = await fetch('https://github.com/login/oauth/access_token', {
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
          code,
        },
      })
    } catch (e) {
      res.send('The connection to GitHub failed.')
      res.end()
      return
    }

    let content
    try {
      content = queryString.parse(resp.buffer)
    } catch (e) {
      res.send('The GitHub OAuth token could not be parsed.')
      res.end()
      return
    }

    const { access_token: token } = content
    if (!token) {
      res.send('The GitHub OAuth process did not return a user token.')
      res.end()
      return
    }

    res.setHeader('Content-Type', 'text/html')
    res.send(
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
    res.end()

    onTokenAccepted(token)
  })
}

export { setRoutes }
