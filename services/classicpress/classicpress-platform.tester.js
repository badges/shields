import { ServiceTester } from '../tester.js'
import {
  isVPlusDottedVersionAtLeastOne,
  isComposerVersion,
} from '../test-validators.js'

export const t = new ServiceTester({
  id: 'ClassicpressPlatform',
  title: 'ClassicPress Platform Tests',
  pathPrefix: '/classicpress',
})

const mockedPlugin = {
  meta: {
    current_version: '1.7.0',
    requires_cp: '1.7',
    requires_php: '7.4',
  },
}

const directoryQuery = slug => ({ byslug: slug, _fields: 'meta' })

t.create('Plugin Required CP Version')
  .get('/plugin/cp-version/switch-to-classicpress.json')
  .expectBadge({
    label: 'classicpress',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Theme Required CP Version')
  .get('/theme/cp-version/kagumi.json')
  .expectBadge({
    label: 'classicpress',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Plugin Required CP Version | Not Set')
  .get('/plugin/cp-version/switch-to-classicpress.json')
  .intercept(nock =>
    nock('https://directory.classicpress.net')
      .get('/wp-json/wp/v2/plugins/')
      .query(directoryQuery('switch-to-classicpress'))
      .reply(200, [{ meta: { ...mockedPlugin.meta, requires_cp: '' } }]),
  )
  .expectBadge({
    label: 'classicpress',
    message: 'not set for this plugin',
  })

t.create('Plugin Required CP Version | Not Found')
  .get('/plugin/cp-version/100.json')
  .intercept(nock =>
    nock('https://directory.classicpress.net')
      .get('/wp-json/wp/v2/plugins/')
      .query(directoryQuery('100'))
      .reply(200, []),
  )
  .expectBadge({
    label: 'classicpress',
    message: 'not found',
  })

t.create('Theme Required CP Version | Not Found')
  .get('/theme/cp-version/100.json')
  .intercept(nock =>
    nock('https://directory.classicpress.net')
      .get('/wp-json/wp/v2/themes/')
      .query(directoryQuery('100'))
      .reply(200, []),
  )
  .expectBadge({
    label: 'classicpress',
    message: 'not found',
  })

t.create('Plugin Required PHP Version')
  .get('/plugin/required-php/switch-to-classicpress.json')
  .expectBadge({
    label: 'php',
    message: isComposerVersion,
  })

t.create('Theme Required PHP Version')
  .get('/theme/required-php/kagumi.json')
  .expectBadge({
    label: 'php',
    message: isComposerVersion,
  })

t.create('Plugin Required PHP Version | Not Set')
  .get('/plugin/required-php/switch-to-classicpress.json')
  .intercept(nock =>
    nock('https://directory.classicpress.net')
      .get('/wp-json/wp/v2/plugins/')
      .query(directoryQuery('switch-to-classicpress'))
      .reply(200, [{ meta: { ...mockedPlugin.meta, requires_php: '' } }]),
  )
  .expectBadge({
    label: 'php',
    message: 'not set for this plugin',
  })

t.create('Theme Required PHP Version | Not Found')
  .get('/theme/required-php/100.json')
  .intercept(nock =>
    nock('https://directory.classicpress.net')
      .get('/wp-json/wp/v2/themes/')
      .query(directoryQuery('100'))
      .reply(200, []),
  )
  .expectBadge({
    label: 'php',
    message: 'not found',
  })
