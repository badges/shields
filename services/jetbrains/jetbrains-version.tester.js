'use strict'

const { isVPlusDottedVersionNClauses } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('empty XML(v)')
  .get('/9435.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=9435')
        .reply(200, '<?xml version="1.0" encoding="UTF-8"?>'),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({
    label: 'jetbrains plugin',
    message: 'unparseable xml response',
  })

t.create('404 status code(v)')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(404)
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'not found' })

t.create('missing required XML element(v)')
  .get('/9435.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=9435')
        .reply(
          200,
          `<?xml version="1.0" encoding="UTF-8"?>
                 <plugin-repository>
                   <ff>"Code editing"</ff>
                   <category name="Code editing">
                     <!-- no required idea-plugin element here -->
                   </category>
                 </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'invalid response data' })

t.create('incorrect response format (JSON instead of XML)(v)')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(200, { version: 2.0 })
  )
  .expectBadge({
    label: 'jetbrains plugin',
    message: 'unparseable xml response',
  })

t.create('empty response(v)')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(200, '')
  )
  .expectBadge({
    label: 'jetbrains plugin',
    message: 'unparseable xml response',
  })

t.create('server error(v)')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(500)
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'inaccessible' })

t.create('connection error(v)')
  .get('/7495.json')
  .networkOff()
  .expectBadge({ label: 'jetbrains plugin', message: 'inaccessible' })

t.create('version for unknown plugin')
  .get('/unknown-plugin.json')
  .expectBadge({ label: 'jetbrains plugin', message: 'not found' })

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

t.create('version (number as a plugin id)')
  .get('/7495.json')
  .expectBadge({
    label: 'jetbrains plugin',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version)')
  .get('/9435.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=9435')
        .reply(
          200,
          `<?xml version="1.0" encoding="UTF-8"?>
            <plugin-repository>
              <category name="Code editing">
                <idea-plugin downloads="2" size="13159" date="1485601807000" url="">
                  <version>1.0</version>
                </idea-plugin>
              </category>
            </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'v1.0' })

t.create('XML with unknown root (v)')
  .get('/9435.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=9435')
        .reply(200, '<?xml version="1.0" encoding="UTF-8"?><plugin />'),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'invalid response data' })
