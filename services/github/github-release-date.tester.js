import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Release Date. e.g release date|today')
  .get('/release-date/mochajs/mocha.json')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
  })

t.create('Release Date - display_date by `created_at` (default)')
  .get('/release-date/microsoft/vscode.json?display_date=created_at')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
  })

t.create('Release Date - display_date by `published_at`')
  .get('/release-date/microsoft/vscode.json?display_date=published_at')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
  })

t.create('Release Date - display_date by `published_at`, incorrect query param')
  .get('/release-date/microsoft/vscode.json?display_date=published_attttttttt')
  .expectBadge({
    label: 'release date',
    message: 'invalid query parameter: display_date',
  })

t.create(
  'Release Date - Should return `no releases or repo not found` for invalid repo',
)
  .get('/release-date/not-valid-name/not-valid-repo.json')
  .expectBadge({
    label: 'release date',
    message: 'no releases or repo not found',
  })

t.create('(Pre-)Release Date. e.g release date|today')
  .get('/release-date-pre/mochajs/mocha.json')
  .expectBadge({
    label: 'release date',
    message: isFormattedDate,
  })

t.create(
  '(Pre-)Release Date - Should return `no releases or repo not found` for invalid repo',
)
  .get('/release-date-pre/not-valid-name/not-valid-repo.json')
  .expectBadge({
    label: 'release date',
    message: 'no releases or repo not found',
  })
