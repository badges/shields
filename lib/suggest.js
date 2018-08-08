'use strict'

const nodeUrl = require('url')
const request = require('request')

// data: {url}, JSON-serializable object.
// end: function(json), with json of the form:
//  - badges: list of objects of the form:
//    - link: target as a string URL.
//    - badge: shields image URL.
//    - name: string
function suggest(allowedOrigin, githubApiProvider, data, end, ask) {
  // The typical dev and production setups are cross-origin. However, in
  // Heroku deploys and some self-hosted deploys these requests may come from
  // the same host.
  const origin = ask.req.headers.origin
  if (origin) {
    if (allowedOrigin.includes(origin)) {
      ask.res.setHeader('Access-Control-Allow-Origin', origin)
    } else {
      ask.res.setHeader('Access-Control-Allow-Origin', 'null')
      end({ err: 'Disallowed' })
      return
    }
  }

  let url
  try {
    url = nodeUrl.parse(data.url)
  } catch (e) {
    end({ err: '' + e })
    return
  }
  findSuggestions(githubApiProvider, url, end)
}

// url: string
// cb: function({badges})
function findSuggestions(githubApiProvider, url, cb) {
  let promises = []
  if (url.hostname === 'github.com') {
    const userRepo = url.pathname.slice(1).split('/')
    const user = userRepo[0]
    const repo = userRepo[1]
    promises = promises.concat([
      githubIssues(user, repo),
      githubForks(user, repo),
      githubStars(user, repo),
      githubLicense(githubApiProvider, user, repo),
    ])
  }
  promises.push(twitterPage(url))
  Promise.all(promises)
    .then(function(badges) {
      // eslint-disable-next-line standard/no-callback-literal
      cb({
        badges: badges.filter(function(b) {
          return b != null
        }),
      })
    })
    .catch(function(err) {
      // eslint-disable-next-line standard/no-callback-literal
      cb({ badges: [], err: err })
    })
}

function twitterPage(url) {
  if (url.protocol === null) {
    return Promise.resolve(null)
  }
  const schema = url.protocol.slice(0, -1)
  const host = url.host
  const path = url.path
  return Promise.resolve({
    name: 'Twitter',
    link:
      'https://twitter.com/intent/tweet?text=Wow:&url=' +
      encodeURIComponent(url.href),
    badge:
      'https://img.shields.io/twitter/url/' +
      schema +
      '/' +
      host +
      path +
      '.svg?style=social',
  })
}

function githubIssues(user, repo) {
  const userRepo = user + '/' + repo
  return Promise.resolve({
    name: 'GitHub issues',
    link: 'https://github.com/' + userRepo + '/issues',
    badge: 'https://img.shields.io/github/issues/' + userRepo + '.svg',
  })
}

function githubForks(user, repo) {
  const userRepo = user + '/' + repo
  return Promise.resolve({
    name: 'GitHub forks',
    link: 'https://github.com/' + userRepo + '/network',
    badge: 'https://img.shields.io/github/forks/' + userRepo + '.svg',
  })
}

function githubStars(user, repo) {
  const userRepo = user + '/' + repo
  return Promise.resolve({
    name: 'GitHub stars',
    link: 'https://github.com/' + userRepo + '/stargazers',
    badge: 'https://img.shields.io/github/stars/' + userRepo + '.svg',
  })
}

function githubLicense(githubApiProvider, user, repo) {
  return new Promise(resolve => {
    const apiUrl = `/repos/${user}/${repo}/license`
    githubApiProvider.request(request, apiUrl, {}, function(err, res, buffer) {
      if (err !== null) {
        resolve(null)
        return
      }
      const defaultBadge = {
        name: 'GitHub license',
        link: `https://github.com/${user}/${repo}`,
        badge: `https://img.shields.io/github/license/${user}/${repo}.svg`,
      }
      if (res.statusCode !== 200) {
        resolve(defaultBadge)
      }
      try {
        const data = JSON.parse(buffer)
        if (data.html_url) {
          defaultBadge.link = data.html_url
          resolve(defaultBadge)
        } else {
          resolve(defaultBadge)
        }
      } catch (e) {
        resolve(defaultBadge)
      }
    })
  })
}

function setRoutes(allowedOrigin, githubApiProvider, server) {
  server.ajax.on('suggest/v1', (data, end, ask) =>
    suggest(allowedOrigin, githubApiProvider, data, end, ask)
  )
}

module.exports = {
  suggest,
  setRoutes,
}
