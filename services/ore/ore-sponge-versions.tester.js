'use strict'

const Joi = require('joi').extend(joi => ({
  base: joi.array(),
  coerce: (value, helpers) => ({
    value: value.split ? value.split(' | ') : value,
  }),
  type: 'versionArray',
}))
const isDottedVersionAtLeastOne = Joi.string().regex(/\d+(\.\d+)?(\.\d+)?$/)
const t = (module.exports = require('../tester').createServiceTester())

t.create('Nucleus (pluginId nucleus)')
  .get('/nucleus.json')
  .expectBadge({
    label: 'for Sponge',
    message: Joi.versionArray().items(isDottedVersionAtLeastOne),
  })

t.create('Nock - no sponge versions in tags')
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
    label: 'for Sponge',
    message: 'no sponge versions in tags',
  })

t.create('Nock - sponge tag without a display_data exists')
  .get('/1.json')
  .intercept(nock =>
    nock('https://ore.spongepowered.org/api/v2/projects/')
      .get('/1')
      .reply(200, {
        promoted_versions: [
          { version: 'dummy', tags: [{ name: 'sponge', display_data: null }] },
          {
            version: 'dummy',
            tags: [{ name: 'sponge', display_data: '1.23' }],
          },
          {
            version: 'dummy',
            tags: [{ name: 'sponge', display_data: '4.56' }],
          },
        ],
        stats: { downloads: 2113, stars: 4 },
        category: 'misc',
        settings: { license: { name: null, url: null } },
      })
  )
  .expectBadge({
    label: 'for Sponge',
    message: '1.23 | 4.56',
  })

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'for Sponge',
  message: 'not found',
})
