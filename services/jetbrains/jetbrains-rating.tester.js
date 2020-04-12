'use strict'

const { withRegex, isStarRating } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const isRating = withRegex(/^(([0-4](.?([0-9]))?)|5)\/5$/)

t.create('rating number (user friendly plugin id)')
  .get('/rating/11941-automatic-power-saver.json')
  .expectBadge({ label: 'rating', message: isRating })

t.create('rating number (plugin id from plugin.xml)')
  .get('/rating/com.chriscarini.jetbrains.jetbrains-auto-power-saver.json')
  .expectBadge({ label: 'rating', message: isRating })

t.create('rating number (number as a plugin id)')
  .get('/rating/11941.json')
  .expectBadge({ label: 'rating', message: isRating })

t.create('rating number for unknown plugin')
  .get('/rating/unknown-plugin.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars (user friendly plugin id)')
  .get('/stars/11941-automatic-power-saver.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('rating stars (plugin id from plugin.xml)')
  .get('/stars/com.chriscarini.jetbrains.jetbrains-auto-power-saver.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('rating stars (number as a plugin id)')
  .get('/stars/11941.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('rating stars for unknown plugin')
  .get('/stars/unknown-plugin.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating number')
  .get('/rating/11941.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=11941')
        .reply(
          200,
          `<?xml version="1.0" encoding="UTF-8"?>
            <plugin-repository>
              <category name="User Interface">
                <idea-plugin downloads="1714" size="208537" date="1586449109000" updatedDate="1586449109000" url="">
                  <rating>4.5</rating>
                </idea-plugin>
              </category>
            </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'rating', message: '4.5/5' })

t.create('rating stars')
  .get('/stars/11941.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get('/plugins/list?pluginId=11941')
        .reply(
          200,
          `<?xml version="1.0" encoding="UTF-8"?>
            <plugin-repository>
              <category name="User Interface">
                <idea-plugin downloads="1714" size="208537" date="1586449109000" updatedDate="1586449109000" url="">
                  <rating>4.5</rating>
                </idea-plugin>
              </category>
            </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'rating', message: '★★★★½' })
