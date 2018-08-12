'use strict'

const crypto = require('crypto')
const log = require('./log')
const secretIsValid = require('./sys/secret-is-valid')
const queryString = require('query-string')
const request = require('request')
const serverSecrets = require('./server-secrets')
const mapKeys = require('lodash.mapkeys')

const userTokenRateLimit = 12500

let githubUserTokens = []
// Ideally, we would want priority queues here.
const reqRemaining = new Map() // From token to requests remaining.
const reqReset = new Map() // From token to timestamp.

// Personal tokens allow access to GitHub private repositories.
// You can manage your personal GitHub token at
// <https://github.com/settings/tokens>.
if (serverSecrets && serverSecrets.gh_token) {
  addGithubToken(serverSecrets.gh_token)
}

function setRoutes(server) {
  const baseUrl = process.env.BASE_URL || 'https://img.shields.io'

  server.route(/^\/github-auth$/, function(data, match, end, ask) {
    if (!(serverSecrets && serverSecrets.gh_client_id)) {
      return end('This server is missing GitHub client secrets.')
    }
    const query = queryString.stringify({
      client_id: serverSecrets.gh_client_id,
      redirect_uri: baseUrl + '/github-auth/done',
    })
    ask.res.statusCode = 302 // Found.
    ask.res.setHeader(
      'Location',
      'https://github.com/login/oauth/authorize?' + query
    )
    end('')
  })

  server.route(/^\/github-auth\/done$/, function(data, match, end, ask) {
    if (
      !(
        serverSecrets &&
        serverSecrets.gh_client_id &&
        serverSecrets.gh_client_secret
      )
    ) {
      return end('This server is missing GitHub client secrets.')
    }
    if (!data.code) {
      log(`GitHub OAuth data.code: ${JSON.stringify(data)}`)
      return end('GitHub OAuth authentication failed to provide a code.')
    }
    const options = {
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Shields.io',
      },
      form: queryString.stringify({
        client_id: serverSecrets.gh_client_id,
        client_secret: serverSecrets.gh_client_secret,
        code: data.code,
      }),
      method: 'POST',
    }
    request(options, function(err, res, body) {
      if (err != null) {
        return end('The connection to GitHub failed.')
      }
      let content
      try {
        content = queryString.parse(body)
      } catch (e) {
        return end('The GitHub OAuth token could not be parsed.')
      }
      const token = content.access_token
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

      sendTokenToAllServers(token).catch(function(e) {
        console.error('GitHub user token transmission failed:', e)
      })
    })
  })

  server.route(/^\/github-auth\/add-token$/, function(data, match, end, ask) {
    if (!secretIsValid(data.shieldsSecret)) {
      // An unknown entity tries to connect. Let the connection linger for 10s.
      return setTimeout(function() {
        end('Invalid secret.')
      }, 10000)
    }
    addGithubToken(data.token)
    end('Thanks!')
  })
}

function sendTokenToAllServers(token) {
  const ips = serverSecrets.shieldsIps
  return Promise.all(
    ips.map(function(ip) {
      return new Promise(function(resolve, reject) {
        const options = {
          url: 'https://' + ip + '/github-auth/add-token',
          method: 'POST',
          form: {
            shieldsSecret: serverSecrets.shieldsSecret,
            token: token,
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
        request(options, function(err, res, body) {
          if (err != null) {
            return reject(err)
          }
          resolve()
        })
      })
    })
  )
}

// token: client token as a string.
// reqs: number of requests remaining.
// reset: timestamp when the number of remaining requests is reset.
function setReqRemaining(token, reqs, reset) {
  reqRemaining.set(token, reqs)
  reqReset.set(token, reset)
}

function rmReqRemaining(token) {
  reqRemaining.delete(token)
  reqReset.delete(token)
}

function utcEpochSeconds() {
  return (Date.now() / 1000) >>> 0
}

// Return false if the token cannot reasonably be expected to perform
// a GitHub request.
function isTokenUsable(token, now) {
  const reqs = reqRemaining.get(token)
  const reset = reqReset.get(token)
  // We don't want to empty more than 3/4 of a user's rate limit.
  const hasRemainingReqs = reqs > userTokenRateLimit / 4
  const isBeyondRateLimitReset = reset < now
  return hasRemainingReqs || isBeyondRateLimitReset
}

// Return a list of tokens (as strings) which can be used for a GitHub request,
// with a reasonable chance that the request will succeed.
function usableTokens() {
  const now = utcEpochSeconds()
  return githubUserTokens.filter(function(token) {
    return isTokenUsable(token, now)
  })
}

// Retrieve a user token if there is one for which we believe there are requests
// remaining. Return undefined if we could not find one.
function getReqRemainingToken() {
  // Go through the user tokens.
  // Among usable ones, use the one with the highest number of remaining
  // requests.
  const tokens = usableTokens()
  let highestReq = -1
  let highestToken
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const reqs = reqRemaining.get(token)
    if (reqs > highestReq) {
      highestReq = reqs
      highestToken = token
    }
  }
  return highestToken
}

function addGithubToken(token) {
  // A reset date of 0 has to be in the past.
  setReqRemaining(token, userTokenRateLimit, 0)
  // Insert it only if it is not registered yet.
  if (githubUserTokens.indexOf(token) === -1) {
    githubUserTokens.push(token)
  }
}

function rmGithubToken(token) {
  rmReqRemaining(token)
  // Remove it only if it is in there.
  const idx = githubUserTokens.indexOf(token)
  if (idx >= 0) {
    githubUserTokens.splice(idx, 1)
  }
}

// Convert an ES6 Map to an object.
function mapToObject(map) {
  const result = {}
  for (const [k, v] of map) {
    result[k] = v
  }
  return result
}

// Compute a one-way hash of the input string.
function sha(str) {
  return crypto
    .createHash('sha256')
    .update(str, 'utf-8')
    .digest('hex')
}

function getAllTokenIds() {
  return githubUserTokens.slice()
}

function removeAllTokens() {
  githubUserTokens = []
}

function serializeDebugInfo(options) {
  // Apply defaults.
  const { sanitize } = Object.assign({ sanitize: true }, options)

  const unsanitized = {
    tokens: githubUserTokens,
    reqRemaining: mapToObject(reqRemaining),
    reqReset: mapToObject(reqReset),
    utcEpochSeconds: utcEpochSeconds(),
    sanitized: false,
  }

  if (sanitize) {
    return {
      tokens: unsanitized.tokens.map(k => sha(k)),
      reqRemaining: mapKeys(unsanitized.reqRemaining, (v, k) => sha(k)),
      reqReset: mapKeys(unsanitized.reqReset, (v, k) => sha(k)),
      utcEpochSeconds: unsanitized.utcEpochSeconds,
      sanitized: true,
    }
  } else {
    return unsanitized
  }
}

// When a global gh_token is configured, use that in place of our shields.io
// token-cycling logic. This produces more predictable behavior when a token
// is provided, and more predictable failures if that token is exhausted.
//
// You can manage your personal GitHub token at https://github.com/settings/tokens
const globalToken = (serverSecrets || {}).gh_token

// Act like request(), but tweak headers and query to avoid hitting a rate
// limit.
function githubRequest(request, url, query, cb) {
  query = query || {}
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  const headers = {
    'User-Agent': 'Shields.io',
    Accept: 'application/vnd.github.v3+json',
  }

  const githubToken =
    globalToken === undefined ? getReqRemainingToken() : globalToken

  if (githubToken != null) {
    // Typically, GitHub user tokens grants us 12500 req/hour.
    headers['Authorization'] = 'token ' + githubToken
  } else if (serverSecrets && serverSecrets.gh_client_id) {
    // Using our OAuth App secret grants us 5000 req/hour
    // instead of the standard 60 req/hour.
    query.client_id = serverSecrets.gh_client_id
    query.client_secret = serverSecrets.gh_client_secret
  }

  const qs = queryString.stringify(query)
  if (qs) {
    url += '?' + qs
  }

  request(url, { headers: headers }, function(err, res, buffer) {
    if (globalToken !== null && githubToken !== null && err === null) {
      if (res.statusCode === 401) {
        // Unauthorized.
        rmGithubToken(githubToken)
      } else {
        const remaining = +res.headers['x-ratelimit-remaining']
        // reset is in UTC epoch seconds.
        const reset = +res.headers['x-ratelimit-reset']
        setReqRemaining(githubToken, remaining, reset)
        if (remaining === 0) {
          return
        } // Hope for the best in the cache.
      }
    }
    cb(err, res, buffer)
  })
}

module.exports = {
  request: githubRequest,
  setRoutes,
  serializeDebugInfo,
  addGithubToken,
  getAllTokenIds,
  removeAllTokens,
}
