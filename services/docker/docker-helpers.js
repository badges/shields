'use strict'

const dockerBlue = '066da5' // see https://github.com/badges/shields/pull/1690

function buildDockerUrl(badgeName, includeTagRoute) {
  if (includeTagRoute) {
    return {
      base: `docker/${badgeName}`,
      pattern: ':user/:repo/:tag*',
    }
  } else {
    return {
      base: `docker/${badgeName}`,
      pattern: ':user/:repo',
    }
  }
}

function getDockerHubUser(user) {
  return user === '_' ? 'library' : user
}

async function getMultiPageData({ user, repo, fetch }) {
  const data = await fetch({ user, repo })
  const numberOfPages = Math.ceil(data.count / 100) // Maximum of 100 results can be returned per page

  if (numberOfPages === 1) {
    return data.results
  }

  const pageData = await Promise.all(
    [...Array(numberOfPages - 1).keys()].map((_, i) =>
      fetch({ user, repo, page: ++i + 1 })
    )
  )
  return [...data.results].concat(...pageData.map(p => p.results))
}

module.exports = {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
}
