'use strict'

const dockerBlue = '066da5' // see https://github.com/badges/shields/pull/1690

function buildDockerUrl(badgeName) {
  return {
    base: `docker/${badgeName}`,
    pattern: ':user/:repo',
  }
}

function getDockerHubUser(user) {
  return user === '_' ? 'library' : user
}

module.exports = { dockerBlue, buildDockerUrl, getDockerHubUser }
