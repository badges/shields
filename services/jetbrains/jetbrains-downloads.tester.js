'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('downloads (number as a plugin id)')
  .get('/7495.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (plugin id from plugin.xml)')
  .get('/org.intellij.scala.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (user friendly plugin id)')
  .get('/1347-scala.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads')
  .get('/9435.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/9435')
      .reply(200, { downloads: 2 })
  )
  .expectBadge({ label: 'downloads', message: '2' })

t.create('unknown plugin (string)')
  .get('/unknown-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('unknown plugin (numeric)')
  .get('/9999999999999.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('unknown plugin (mixed)')
  .get('/9999999999999-abc.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
