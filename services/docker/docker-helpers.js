'use strict'

const dockerBlue = '066da5' // see https://github.com/badges/shields/pull/1690

const buildDockerUrl = function(badgeName) {
  return {
    base: `docker/${badgeName}`,
    pattern: ':user/:repo',
  }
}

const getDockerHubUser = function(user) {
  return user === '_' ? 'library' : user
}

module.exports = { dockerBlue, buildDockerUrl, getDockerHubUser }
