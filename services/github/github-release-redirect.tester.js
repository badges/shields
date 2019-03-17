'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'GithubReleaseRedirect',
  title: 'Github Release redirect',
  pathPrefix: '',
}))

t.create('(pre-)Release (for legacy compatibility)')
  .get('/github/release/photonstorm/phaser/all.svg', { followRedirect: false })
  .expectStatus(301)
  .expectHeader('Location', '/github/release-pre/photonstorm/phaser.svg')
