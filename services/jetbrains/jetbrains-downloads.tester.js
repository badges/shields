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
  .get('/unknown-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('connection error')
  .get('/7495.json')
  .networkOff()
  .expectBadge({ label: 'downloads', message: 'inaccessible' })

t.create('server error')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(500)
  )
  .expectBadge({ label: 'downloads', message: 'inaccessible' })

t.create('empty response')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(200, '')
  )
  .expectBadge({ label: 'downloads', message: 'unparseable xml response' })

t.create('incorrect response format (JSON instead of XML)')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(200, { downloads: 2 })
  )
  .expectBadge({ label: 'downloads', message: 'unparseable xml response' })

t.create('missing required XML element')
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
  .expectBadge({ label: 'downloads', message: 'invalid response data' })

t.create('missing required XML attribute')
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
  .expectBadge({ label: 'downloads', message: 'unparseable xml response' })

t.create('XML with unknown root')
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
  .expectBadge({ label: 'downloads', message: 'invalid response data' })

t.create('404 status code')
  .get('/7495.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/plugins/list?pluginId=7495')
      .reply(404)
  )
  .expectBadge({ label: 'downloads', message: 'not found' })
