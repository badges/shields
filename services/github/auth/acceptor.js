'use strict'

const queryString = require('query-string')
const request = require('request')
const log = require('../../../lib/log')
const githubAuth = require('../../../lib/github-auth')
const serverSecrets = require('../../../lib/server-secrets')
const secretIsValid = require('../../../lib/sys/secret-is-valid')

function sendTokenToAllServers(token) {
  const { shieldsIps, shields_secret: shieldsSecret } = serverSecrets
  return Promise.all(
    shieldsIps.map(
      ip =>
        new Promise((resolve, reject) => {
          const options = {
            url: `https://${ip}/github-auth/add-token`,
            method: 'POST',
            form: {
              shieldsSecret,
              token,
            },
            // We target servers by IP, and we use HTTPS. Assuming that
            // 1. Internet routers aren't hacked, and
            // 2. We don't unknowingly lose our IP to someone else,
            // we're not leaking people's and our information.
            // (If we did, it would have no impact, as we only ask for a token,
            // no GitHub scope. The malicious entity would only be able to use
            // our rate limit pool.)
            // FIXME: use letsencrypt.
            strictSSL: false,
          }
          request(options, (err, res, body) => {
            if (err != null) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
    )
  )
}

function setRoutes(server) {
  const baseUrl = process.env.BASE_URL || 'https://img.shields.io'

  server.route(/^\/github-auth$/, (data, match, end, ask) => {
    ask.res.statusCode = 302 // Found.
    const query = queryString.stringify({
      client_id: serverSecrets.gh_client_id,
      redirect_uri: `${baseUrl}/github-auth/done`,
    })
    ask.res.setHeader(
      'Location',
      `https://github.com/login/oauth/authorize?${query}`
    )
    end('')
  })

  server.route(/^\/github-auth\/done$/, (data, match, end, ask) => {
    if (!data.code) {
      log(`GitHub OAuth data: ${JSON.stringify(data)}`)
      return end('GitHub OAuth authentication failed to provide a code.')
    }

    const options = {
      url: 'https://github.com/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Shields.io',
      },
      form: queryString.stringify({
        client_id: serverSecrets.gh_client_id,
        client_secret: serverSecrets.gh_client_secret,
        code: data.code,
      }),
    }
    request(options, (err, res, body) => {
      if (err != null) {
        return end('The connection to GitHub failed.')
      }

      let content
      try {
        content = queryString.parse(body)
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

      sendTokenToAllServers(token).catch(e => {
        console.error('GitHub user token transmission failed:', e)
      })
    })
  })

  server.route(/^\/github-auth\/add-token$/, (data, match, end, ask) => {
    if (!secretIsValid(data.shieldsSecret)) {
      // An unknown entity tries to connect. Let the connection linger for 10s.
      setTimeout(() => {
        end('Invalid secret.')
      }, 10000)
      return
    }

    githubAuth.addGithubToken(data.token)
    end('Thanks!')
  })
}

module.exports = {
  sendTokenToAllServers,
  setRoutes,
}
