import { ServiceTester } from '../tester.js'
import { isMetric, isFileSize, isFormattedDate } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'steam',
  title: 'Steam Workshop Tests',
})

t.create('Collection Files')
  .get('/collection-files/180077636.json')
  .expectBadge({ label: 'files', message: isMetric })

t.create('File Size')
  .get('/size/1523924535.json')
  .expectBadge({ label: 'size', message: isFileSize })

t.create('Release Date')
  .get('/release-date/1523924535.json')
  .expectBadge({ label: 'release date', message: isFormattedDate })

t.create('Update Date')
  .get('/update-date/1523924535.json')
  .expectBadge({ label: 'update date', message: isFormattedDate })

t.create('Subscriptions')
  .get('/subscriptions/1523924535.json')
  .expectBadge({ label: 'subscriptions', message: isMetric })

t.create('Favorites')
  .get('/favorites/1523924535.json')
  .expectBadge({ label: 'favorites', message: isMetric })

t.create('Downloads')
  .get('/downloads/1523924535.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Views')
  .get('/views/1523924535.json')
  .expectBadge({ label: 'views', message: isMetric })

t.create('Collection Files | Collection Not Found')
  .get('/collection-files/1.json')
  .expectBadge({ label: 'files', message: 'collection not found' })

t.create('File Size | File Not Found')
  .get('/size/1.json')
  .expectBadge({ label: 'size', message: 'file not found' })

t.create('Release Date | File Not Found')
  .get('/release-date/1.json')
  .expectBadge({ label: 'release date', message: 'file not found' })

t.create('Update Date | File Not Found')
  .get('/update-date/1.json')
  .expectBadge({ label: 'update date', message: 'file not found' })

t.create('Subscriptions | File Not Found')
  .get('/subscriptions/1.json')
  .expectBadge({ label: 'subscriptions', message: 'file not found' })

t.create('Favorites | File Not Found')
  .get('/favorites/1.json')
  .expectBadge({ label: 'favorites', message: 'file not found' })

t.create('Downloads | File Not Found')
  .get('/downloads/1.json')
  .expectBadge({ label: 'downloads', message: 'file not found' })

t.create('Views | File Not Found')
  .get('/views/1.json')
  .expectBadge({ label: 'views', message: 'file not found' })
