import { withRegex, isStarRating } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

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

t.create('rating number for unknown plugin (string)')
  .get('/rating/unknown-plugin.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (numeric)')
  .get('/stars/9999999999999.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (mixed)')
  .get('/stars/9999999999999-abc.json')
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

t.create('rating stars for unknown plugin (string id)')
  .get('/stars/unknown-plugin.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (numeric id)')
  .get('/stars/9999999999999.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (mixed id)')
  .get('/stars/9999999999999-abc.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating number (numeric id)')
  .get('/rating/11941.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/11941/rating')
      .reply(200, {
        votes: {
          4: 1,
          5: 4,
        },
        meanVotes: 2,
        meanRating: 4.15669,
      })
  )
  .expectBadge({ label: 'rating', message: '4.6/5' })

t.create('rating number for "no vote" plugin (numeric id)')
  .get('/rating/10998.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/10998/rating')
      .reply(200, {
        votes: {},
        meanVotes: 2,
        meanRating: 4.15669,
      })
  )
  .expectBadge({ label: 'rating', message: 'No Plugin Ratings' })

t.create('rating number (string id)')
  .get('/rating/com.chriscarini.jetbrains.jetbrains-auto-power-saver.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get(
          '/plugins/list?pluginId=com.chriscarini.jetbrains.jetbrains-auto-power-saver'
        )
        .reply(
          200,
          `<?xml version="1.0" encoding="UTF-8"?>
            <plugin-repository>
              <category name="User Interface">
                <idea-plugin downloads="1714" size="208537" date="1586449109000" updatedDate="1586449109000" url="">
                  <rating>4.4848</rating>
                </idea-plugin>
              </category>
            </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'rating', message: '4.5/5' })

t.create('rating stars (numeric id)')
  .get('/stars/11941.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/11941/rating')
      .reply(200, {
        votes: {
          4: 1,
          5: 4,
        },
        meanVotes: 2,
        meanRating: 4.15669,
      })
  )
  .expectBadge({ label: 'rating', message: '★★★★½' })

t.create('rating stars (string id)')
  .get('/stars/com.chriscarini.jetbrains.jetbrains-auto-power-saver.json')
  .intercept(
    nock =>
      nock('https://plugins.jetbrains.com')
        .get(
          '/plugins/list?pluginId=com.chriscarini.jetbrains.jetbrains-auto-power-saver'
        )
        .reply(
          200,
          `<?xml version="1.0" encoding="UTF-8"?>
            <plugin-repository>
              <category name="User Interface">
                <idea-plugin downloads="1714" size="208537" date="1586449109000" updatedDate="1586449109000" url="">
                  <rating>4.4848</rating>
                </idea-plugin>
              </category>
            </plugin-repository>`
        ),
    {
      'Content-Type': 'text/xml;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'rating', message: '★★★★½' })
