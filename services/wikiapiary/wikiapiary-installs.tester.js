import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'wikiapiary',
  title: 'WikiApiary',
})

t.create('Extension')
  .get('/extension/installs/ParserFunctions.json')
  .expectBadge({ label: 'wikiapiary', message: 'no longer available' })

t.create('Skins')
  .get('/skin/installs/Vector.json')
  .expectBadge({ label: 'wikiapiary', message: 'no longer available' })
