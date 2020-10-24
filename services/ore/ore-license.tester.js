'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'license',
  message: 'MIT licence',
})

t.create('Nock - no license specified (null)')
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
    label: 'license',
    message: 'no license specified',
  })

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'license',
  message: 'not found',
})
