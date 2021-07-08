import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Extension')
  .get('/extension/installs/ParserFunctions.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Skins')
  .get('/skin/installs/Vector.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Extension Not Found')
  .get('/extension/installs/FakeExtensionThatDoesNotExist.json')
  .expectBadge({ label: 'installs', message: 'not found' })

t.create('Name Lowercase')
  .get('/extension/installs/parserfunctions.json')
  .expectBadge({ label: 'installs', message: 'not found' })

t.create('Name Title Case')
  .get('/extension/installs/parserFunctions.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Malformed API Response')
  .get('/extension/installs/ParserFunctions.json')
  .intercept(nock =>
    nock('https://wikiapiary.com')
      .get('/w/api.php')
      .query({
        action: 'ask',
        query: '[[extension:ParserFunctions]]|?Has_website_count',
        format: 'json',
      })
      .reply(200, {
        query: {
          results: {
            'Extension:Malformed': { printouts: { 'Has website count': [0] } },
          },
        },
      })
  )
  .expectBadge({ label: 'installs', message: 'not found' })
