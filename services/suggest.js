// Suggestion API
//
// eg. /$suggest/v1?url=https://github.com/badges/shields
//
// This endpoint is called from frontend/components/suggestion-and-search.js.

import { URL } from 'url'
import { fetch } from '../core/base-service/got.js'

function twitterPage(url) {
  if (url.protocol === null) {
    return null
  }

  const schema = url.protocol.slice(0, -1)
  const host = url.host
  const path = url.pathname
  return {
    title: 'Twitter',
    link: `https://twitter.com/intent/tweet?text=Wow:&url=${encodeURIComponent(
      url.href
    )}`,
    example: {
      pattern: '/twitter/url',
      namedParams: {},
      queryParams: { url: `${schema}://${host}${path}` },
    },
    preview: {
      style: 'social',
    },
  }
}

function githubIssues(user, repo) {
  const repoSlug = `${user}/${repo}`
  return {
    title: 'GitHub issues',
    link: `https://github.com/${repoSlug}/issues`,
    example: {
      pattern: '/github/issues/:user/:repo',
      namedParams: { user, repo },
      queryParams: {},
    },
  }
}

function githubForks(user, repo) {
  const repoSlug = `${user}/${repo}`
  return {
    title: 'GitHub forks',
    link: `https://github.com/${repoSlug}/network`,
    example: {
      pattern: '/github/forks/:user/:repo',
      namedParams: { user, repo },
      queryParams: {},
    },
  }
}

function githubStars(user, repo) {
  const repoSlug = `${user}/${repo}`
  return {
    title: 'GitHub stars',
    link: `https://github.com/${repoSlug}/stargazers`,
    example: {
      pattern: '/github/stars/:user/:repo',
      namedParams: { user, repo },
      queryParams: {},
    },
  }
}

async function githubLicense(githubApiProvider, user, repo) {
  const repoSlug = `${user}/${repo}`

  let link = `https://github.com/${repoSlug}`

  const { buffer } = await githubApiProvider.fetch(
    fetch,
    `/repos/${repoSlug}/license`
  )
  try {
    const data = JSON.parse(buffer)
    if ('html_url' in data) {
      link = data.html_url
    }
  } catch (e) {}

  return {
    title: 'GitHub license',
    link,
    example: {
      pattern: '/github/license/:user/:repo',
      namedParams: { user, repo },
      queryParams: {},
    },
  }
}

function gitlabPipeline(user, repo) {
  const repoSlug = `${user}/${repo}`
  return {
    title: 'GitLab pipeline',
    link: `https://gitlab.com/${repoSlug}/builds`,
    example: {
      pattern: '/gitlab/pipeline/:user/:repo',
      namedParams: { user, repo },
      queryParams: {},
    },
  }
}

async function findSuggestions(githubApiProvider, url) {
  let promises = []
  if (url.hostname === 'github.com' || url.hostname === 'gitlab.com') {
    const userRepo = url.pathname.slice(1).split('/')
    const user = userRepo[0]
    const repo = userRepo[1]
    if (url.hostname === 'github.com') {
      promises = promises.concat([
        githubIssues(user, repo),
        githubForks(user, repo),
        githubStars(user, repo),
        githubLicense(githubApiProvider, user, repo),
      ])
    } else {
      promises = promises.concat([gitlabPipeline(user, repo)])
    }
  }
  promises.push(twitterPage(url))

  const suggestions = await Promise.all(promises)

  return suggestions.filter(b => b != null)
}

// data: {url}, JSON-serializable object.
// end: function(json), with json of the form:
//  - suggestions: list of objects of the form:
//    - title: string
//    - link: target as a string URL
//    - example: object
//      - pattern: string
//      - namedParams: object
//      - queryParams: object (optional)
//        - link: target as a string URL
//    - preview: object (optional)
//      - style: string
function setRoutes(allowedOrigin, githubApiProvider, server) {
  server.ajax.on('suggest/v1', (data, end, ask) => {
    // The typical dev and production setups are cross-origin. However, in
    // Heroku deploys and some self-hosted deploys these requests may come from
    // the same host. Chrome does not send an Origin header on same-origin
    // requests, but Firefox does.
    //
    // It would be better to solve this problem using some well-tested
    // middleware.
    const origin = ask.req.headers.origin
    if (origin) {
      let host
      try {
        host = new URL(origin).hostname
      } catch (e) {
        ask.res.setHeader('Access-Control-Allow-Origin', 'null')
        end({ err: 'Disallowed' })
        return
      }

      if (host !== ask.req.headers.host) {
        if (allowedOrigin.includes(origin)) {
          ask.res.setHeader('Access-Control-Allow-Origin', origin)
        } else {
          ask.res.setHeader('Access-Control-Allow-Origin', 'null')
          end({ err: 'Disallowed' })
          return
        }
      }
    }

    let url
    try {
      url = new URL(data.url)
    } catch (e) {
      end({ err: `${e}` })
      return
    }

    findSuggestions(githubApiProvider, url)
      // This interacts with callback code and can't use async/await.
      // eslint-disable-next-line promise/prefer-await-to-then
      .then(suggestions => {
        end({ suggestions })
      })
      // eslint-disable-next-line promise/prefer-await-to-then
      .catch(err => {
        end({ suggestions: [], err })
      })
  })
}

export { findSuggestions, githubLicense, setRoutes }
