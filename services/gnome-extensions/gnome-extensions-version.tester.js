import { createServiceTester } from '../tester.js'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Version')
  .get('/just-perfection-desktop@just-perfection.json')
  .expectBadge({ label: 'version', message: isVPlusDottedVersionAtLeastOne })

t.create('Version (not found)').get('/non-existent.json').expectBadge({
  label: 'version',
  message: 'no active version found',
})

t.create('No active versions')
  .get('/no-active.json')
  .intercept(nock =>
    nock('https://extensions.gnome.org')
      .get('/api/v1/extensions/no-active/versions/')
      .query({ page_size: '100' })
      .reply(200, { results: [] }),
  )
  .expectBadge({
    label: 'version',
    message: 'no active version found',
  })
