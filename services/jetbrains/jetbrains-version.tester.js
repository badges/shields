'use strict'

const { isVPlusDottedVersionNClauses } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version (user friendly plugin id)')
  .get('/1347-scala.json')
  .expectBadge({
    label: 'jetbrains plugin',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (plugin id from plugin.xml)')
  .get('/org.intellij.scala.json')
  .expectBadge({
    label: 'jetbrains plugin',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (number as a plugin id)').get('/7495.json').expectBadge({
  label: 'jetbrains plugin',
  message: isVPlusDottedVersionNClauses,
})

t.create('version')
  .get('/9435.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/9435/updates')
      .reply(200, [{ version: '1.0' }])
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'v1.0' })

t.create('version for unknown plugin (string)')
  .get('/unknown-plugin.json')
  .expectBadge({ label: 'jetbrains plugin', message: 'not found' })

t.create('version for unknown plugin (numeric)')
  .get('/9999999999999.json')
  .expectBadge({ label: 'jetbrains plugin', message: 'not found' })

t.create('unknown plugin (mixed)')
  .get('/9999999999999-abc.json')
  .expectBadge({ label: 'jetbrains plugin', message: 'not found' })
