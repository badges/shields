'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'version',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Nock - no promoted versions')
  .get('/1.json')
  .intercept(nock =>
    nock('https://ore.spongepowered.org/api/v2/projects/')
      .get('/1')
      .reply(200, {
        promoted_versions: [],
        stats: { downloads: 2113, stars: 4 },
        category: 'misc',
        settings: { license: { name: null, url: null } },
      })
  )
  .expectBadge({
    label: 'version',
    message: 'no promoted versions',
  })

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'version',
  message: 'not found',
})
