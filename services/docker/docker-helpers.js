import Joi from 'joi'
// see https://github.com/badges/shields/pull/1690
import { NotFound } from '../index.js'
const dockerBlue = '066da5'
const maxDockerHubAnonymousPages = 10

const archEnum = [
  'amd64',
  'arm',
  'arm64',
  's390x',
  '386',
  'ppc64',
  'ppc64le',
  'wasm',
  'mips',
  'mipsle',
  'mips64',
  'mips64le',
  'riscv64',
  'loong64',
]

// Valid architecture values: https://golang.org/doc/install/source#environment (GOARCH)
const archSchema = Joi.alternatives(
  Joi.string().valid(...archEnum),
  Joi.number().valid(386).cast('string'),
)

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

async function getMultiPageData({
  user,
  repo,
  fetch,
  isAuthenticated = false,
  shouldFetchRemainingPages = () => true,
}) {
  const firstPageData = await fetch({ user, repo })

  if (firstPageData.count === 0) {
    throw new NotFound({ prettyMessage: 'repository not found' })
  }

  if (!shouldFetchRemainingPages(firstPageData.results)) {
    return firstPageData.results
  }

  // Maximum of 100 results can be returned per page. Docker Hub rejects
  // anonymous requests for page 11 (offset 1,000) with the following error:
  // "pagination offset too large for anonymous requests; sign in to page further".
  const maxPages = isAuthenticated ? Infinity : maxDockerHubAnonymousPages
  const numberOfPages = Math.min(Math.ceil(firstPageData.count / 100), maxPages)

  const pageData = await Promise.all(
    Array.from({ length: numberOfPages - 1 }, (_, pageIndex) =>
      fetch({ user, repo, page: pageIndex + 2 }),
    ),
  )
  return [firstPageData, ...pageData].flatMap(({ results }) => results)
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
  archEnum,
  archSchema,
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
  getMultiPageData,
  getDigestSemVerMatches,
}
