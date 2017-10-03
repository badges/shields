'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { isMetric } = require('./helpers/validators');

const t = new ServiceTester({ id: 'jetbrains', title: 'JetBrains plugin' });
module.exports = t;

t.create('downloads (number as a plugin id)')
  .get('/plugin/d/7495.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }));

t.create('downloads (plugin id from plugin.xml)')
  .get('/plugin/d/org.intellij.scala.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }));

t.create('downloads (user friendly plugin id)')
  .get('/plugin/d/1347-scala.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }));

t.create('unknown plugin')
  .get('/plugin/d/unknown-plugin.json')
  .expectJSON({ name: 'downloads', value: 'not found' });

t.create('connection error')
  .get('/plugin/d/7495.json')
  .networkOff()
  .expectJSON({ name: 'downloads', value: 'inaccessible' });

t.create('server error')
  .get('/plugin/d/7495.json')
  .intercept(nock => nock('https://plugins.jetbrains.com')
    .get('/plugins/list?pluginId=7495')
    .reply(500)
  )
  .expectJSON({ name: 'downloads', value: 'inaccessible' });

t.create('empty response')
  .get('/plugin/d/7495.json')
  .intercept(nock => nock('https://plugins.jetbrains.com')
    .get('/plugins/list?pluginId=7495')
    .reply(200, '')
  )
  .expectJSON({ name: 'downloads', value: 'invalid' });

t.create('incorrect response format (JSON instead of XML)')
  .get('/plugin/d/7495.json')
  .intercept(nock => nock('https://plugins.jetbrains.com')
    .get('/plugins/list?pluginId=7495')
    .reply(200, { downloads: 2 })
  )
  .expectJSON({ name: 'downloads', value: 'invalid' });

t.create('missing required XML element')
  .get('/plugin/d/9435.json')
  .intercept(nock => nock('https://plugins.jetbrains.com')
    .get('/plugins/list?pluginId=9435')
    .reply(200, `<?xml version="1.0" encoding="UTF-8"?>
                 <plugin-repository>
                   <ff>"Code editing"</ff>
                   <category name="Code editing">
                     <!-- no required idea-plugin element here -->
                   </category>
                 </plugin-repository>`), {
                   'Content-Type': 'text/xml;charset=UTF-8'
                 })
  .expectJSON({ name: 'downloads', value: 'invalid' });

t.create('missing required XML attribute')
  .get('/plugin/d/9435.json')
  .intercept(nock => nock('https://plugins.jetbrains.com')
    .get('/plugins/list?pluginId=9435')
    .reply(200, `<?xml version="1.0" encoding="UTF-8"?>
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
                 </plugin-repository>`), {
                   'Content-Type': 'text/xml;charset=UTF-8'
                 })
  .expectJSON({ name: 'downloads', value: 'invalid' });

t.create('empty XML')
  .get('/plugin/d/9435.json')
  .intercept(nock => nock('https://plugins.jetbrains.com')
    .get('/plugins/list?pluginId=9435')
    .reply(200, '<?xml version="1.0" encoding="UTF-8"?>'), {
      'Content-Type': 'text/xml;charset=UTF-8'
    })
  .expectJSON({ name: 'downloads', value: 'invalid' });

t.create('404 status code')
  .get('/plugin/d/7495.json')
  .intercept(nock => nock('https://plugins.jetbrains.com')
    .get('/plugins/list?pluginId=7495')
    .reply(404)
  )
  .expectJSON({ name: 'downloads', value: 'inaccessible' });
