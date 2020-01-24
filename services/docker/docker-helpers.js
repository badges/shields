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
  /* Initial request to get number of pages */
  const data = []
  data.push(await fetch({ user, repo }))
  const numberOfPages = Math.ceil(data[0].count / 100)
  if (numberOfPages) {
    /* Fetch additional page data */
    const pageData = []
    /* Invoke fetch for each page */
    for (let i = 1; numberOfPages > i; ++i) {
      pageData.push(fetch({ user, repo, page: i + 1 }))
    }
    /* Await each promise */
    for (const promise of pageData) {
      data.push(await promise)
    }
  }
  /* Flatten data.results into a new array */
  let dataset = []
  data.forEach(page => {
    dataset = dataset.concat(page.results)
  })
  return dataset
}

module.exports = {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
}
