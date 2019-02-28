'use strict'

const { ServiceTester } = require('../tester')
const { isMetric, isVPlusDottedVersionNClauses } = require('../test-validators')

const t = new ServiceTester({ id: 'jetbrains', title: 'JetBrains' })
module.exports = t

t.create('downloads (number as a plugin id)')
  .get('/plugin/d/7495.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (plugin id from plugin.xml)')
  .get('/plugin/d/org.intellij.scala.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (user friendly plugin id)')
  .get('/plugin/d/1347-scala.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (mocked)')
  .get('/plugin/d/9435.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=9435')
        .reply(
          200,
          `<?xml version="1.0" encoding="UTF-8"?>
            <plugin-repository>
              <category name="Code editing">
                <idea-plugin downloads="2" size="13159" date="1485601807000" url=""></idea-plugin>
              </category>
            </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'downloads', message: '2' })

t.create('unknown plugin')
  .get('/plugin/d/unknown-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('connection error')
  .get('/plugin/d/7495.json')
  .networkOff()
  .expectBadge({ label: 'downloads', message: 'inaccessible' })

t.create('server error')
  .get('/plugin/d/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(500)
  )
  .expectBadge({ label: 'downloads', message: 'inaccessible' })

t.create('empty response')
  .get('/plugin/d/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(200, '')
  )
  .expectBadge({ label: 'downloads', message: 'unparseable xml response' })

t.create('incorrect response format (JSON instead of XML)')
  .get('/plugin/d/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(200, { downloads: 2 })
  )
  .expectBadge({ label: 'downloads', message: 'unparseable xml response' })

t.create('missing required XML element')
  .get('/plugin/d/9435.json')
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
  .expectBadge({ label: 'downloads', message: 'invalid response data' })

t.create('missing required XML attribute')
  .get('/plugin/d/9435.json')
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
                     <idea-plugin NO-REQUIRED-DOWNLOADS-ATTRIBUTE-HERE="2" size="13159" date="1485601807000" url="">
                       <name>Harply</name>
                       <id>io.harply.plugin</id>
                       <description><![CDATA[This plugin converts xml layouts and java classes into a compatible format to enable harply integration
                 <br>
                 <em>Any nested layout with include tag is currently not supported</em>]]></description>
                       <version>1.0</version>
                       <vendor email="support@harply.io" url="">Harply</vendor>
                       <idea-version min="n/a" max="n/a" since-build="141.0"/>
                       <change-notes><![CDATA[Bug fixes]]></change-notes>
                       <rating>00</rating>
                     </idea-plugin>
                   </category>
                 </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'downloads', message: 'invalid response data' })

t.create('empty XML')
  .get('/plugin/d/9435.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=9435')
        .reply(200, '<?xml version="1.0" encoding="UTF-8"?>'),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'downloads', message: 'unparseable xml response' })

t.create('XML with unknown root')
  .get('/plugin/d/9435.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=9435')
        .reply(200, '<?xml version="1.0" encoding="UTF-8"?><plugin />'),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'downloads', message: 'invalid response data' })

t.create('404 status code')
  .get('/plugin/d/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(404)
  )
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('empty XML(v)')
  .get('/plugin/v/9435.json')
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
  .get('/plugin/v/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(404)
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'not found' })

t.create('missing required XML element(v)')
  .get('/plugin/v/9435.json')
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
  .get('/plugin/v/7495.json')
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
  .get('/plugin/v/7495.json')
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
  .get('/plugin/v/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(500)
  )
  .expectBadge({ label: 'jetbrains plugin', message: 'inaccessible' })

t.create('connection error(v)')
  .get('/plugin/v/7495.json')
  .networkOff()
  .expectBadge({ label: 'jetbrains plugin', message: 'inaccessible' })

t.create('version for unknown plugin')
  .get('/plugin/v/unknown-plugin.json')
  .expectBadge({ label: 'jetbrains plugin', message: 'not found' })

t.create('version (user friendly plugin id)')
  .get('/plugin/v/1347-scala.json')
  .expectBadge({
    label: 'jetbrains plugin',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (plugin id from plugin.xml)')
  .get('/plugin/v/org.intellij.scala.json')
  .expectBadge({
    label: 'jetbrains plugin',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (number as a plugin id)')
  .get('/plugin/v/7495.json')
  .expectBadge({
    label: 'jetbrains plugin',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (mocked)')
  .get('/plugin/v/9435.json')
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
  .get('/plugin/v/9435.json')
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
