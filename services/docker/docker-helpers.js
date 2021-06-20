// see https://github.com/badges/shields/pull/1690
import { NotFound } from '../index.js'
const dockerBlue = '066da5'

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

  if (data.count === 0) {
    throw new NotFound({ prettyMessage: 'repository not found' })
  }

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

function getDigestSemVerMatches({ data, digest }) {
  const matches = data
    .filter(d => d.images.some(i => i.digest === digest))
    .map(d => d.name)
  let version = matches[0]
  matches.forEach(name => {
    const dots = (name.match(/\./g) || []).length
    const olddots = (version.match(/\./g) || []).length
    version = dots >= olddots && name !== 'latest' ? name : version
  })
  return version
}

export {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
  getDigestSemVerMatches,
}
