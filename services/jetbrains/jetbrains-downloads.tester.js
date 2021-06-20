import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('downloads (number as a plugin id)')
  .get('/7495.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (plugin id from plugin.xml)')
  .get('/org.intellij.scala.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (user friendly plugin id)')
  .get('/1347-scala.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (numeric id)')
  .get('/9435.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/9435')
      .reply(200, { downloads: 2 })
  )
  .expectBadge({ label: 'downloads', message: '2' })

t.create('downloads (string id)')
  .get('/io.harply.plugin.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=io.harply.plugin')
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

t.create('unknown plugin (string id)')
  .get('/unknown-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('unknown plugin (numeric id)')
  .get('/9999999999999.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('unknown plugin (mixed id)')
  .get('/9999999999999-abc.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
