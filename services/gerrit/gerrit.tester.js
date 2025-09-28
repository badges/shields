import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Change open since September 2017, hopefully won't get merged or abandoned anytime soon.
// https://android-review.googlesource.com/c/platform/bootable/recovery/+/494609
t.create('Gerrit new change')
  .get('/494609.json?baseUrl=https://android-review.googlesource.com')
  .expectBadge({
    label: 'change 494609',
    message: 'new',
    color: '#2cbe4e',
  })

t.create('Gerrit merged change')
  .get('/1011478.json?baseUrl=https://android-review.googlesource.com')
  .expectBadge({
    label: 'change 1011478',
    message: 'merged',
    color: 'blueviolet',
  })

t.create('Gerrit abandoned change')
  .get('/69361.json?baseUrl=https://gerrit.libreoffice.org')
  .expectBadge({
    label: 'change 69361',
    message: 'abandoned',
    color: 'red',
  })

t.create('Gerrit change not found')
  .get('/1000000000.json?baseUrl=https://chromium-review.googlesource.com')
  .expectBadge({
    label: 'gerrit',
    message: 'change not found',
  })

t.create('Gerrit invalid baseUrl')
  .get('/123.json?baseUrl=something')
  .expectBadge({
    label: 'gerrit',
    message: 'invalid query parameter: baseUrl',
  })
