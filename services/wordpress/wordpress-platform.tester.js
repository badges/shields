import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import {
  isVPlusDottedVersionAtLeastOne,
  isComposerVersion,
} from '../test-validators.js'

export const t = new ServiceTester({
  id: 'WordpressPlatform',
  title: 'WordPress Platform Tests',
  pathPrefix: '/wordpress',
})

t.create('Plugin Required WP Version')
  .get('/plugin/wp-version/akismet.json')
  .expectBadge({
    label: 'wordpress',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Theme Required WP Version')
  .get('/theme/wp-version/twentytwenty.json')
  .expectBadge({
    label: 'wordpress',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Plugin Tested WP Version')
  .get('/plugin/tested/akismet.json')
  .expectBadge({
    label: 'wordpress',
    message: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)? tested$/),
  })

const mockedQueryFields = {
  active_installs: '1',
  sections: '0',
  homepage: '0',
  tags: '0',
  screenshot_url: '0',
  downloaded: 1,
  requires_php: 1,
  last_updated: 1,
}

const mockedQuerySelector = {
  action: 'plugin_information',
  request: {
    slug: 'akismet',
    fields: mockedQueryFields,
  },
}

const mockedCoreResponseData = {
  offers: [{ version: '4.9.8' }, { version: '4.9.6' }],
}

t.create('Plugin Tested WP Version - current')
  .get('/plugin/tested/akismet.json')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/plugins/info/1.2/')
      .query(mockedQuerySelector)
      .reply(200, {
        version: '1.3',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: '4.9',
        tested: '4.9.8',
        last_updated: '2020-01-01 7:21am GMT',
        requires_php: '5.5',
      })
      .get('/core/version-check/1.7/')
      .reply(200, mockedCoreResponseData)
  )
  .expectBadge({
    label: 'wordpress',
    message: 'v4.9.8 tested',
    color: 'brightgreen',
  })

t.create('Plugin Tested WP Version - old')
  .get('/plugin/tested/akismet.json')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/plugins/info/1.2/')
      .query(mockedQuerySelector)
      .reply(200, {
        version: '1.2',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: '4.9',
        tested: '4.9.6',
        last_updated: '2020-01-01 7:21am GMT',
        requires_php: '5.5',
      })
      .get('/core/version-check/1.7/')
      .reply(200, mockedCoreResponseData)
  )
  .expectBadge({
    label: 'wordpress',
    message: 'v4.9.6 tested',
    color: 'orange',
  })

t.create('Plugin Tested WP Version - non-exsistant or unsupported')
  .get('/plugin/tested/akismet.json')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/plugins/info/1.2/')
      .query(mockedQuerySelector)
      .reply(200, {
        version: '1.2',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: '4.0',
        tested: '4.0.0',
        last_updated: '2020-01-01 7:21am GMT',
        requires_php: '5.5',
      })
      .get('/core/version-check/1.7/')
      .reply(200, mockedCoreResponseData)
  )
  .expectBadge({
    label: 'wordpress',
    message: 'v4.0.0 tested',
    color: 'yellow',
  })

t.create('Plugin Required WP Version | Missing')
  .get('/plugin/wp-version/akismet.json')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/plugins/info/1.2/')
      .query(mockedQuerySelector)
      .reply(200, {
        version: '1.2',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: false,
        tested: '4.0.0',
        last_updated: '2020-01-01 7:21am GMT',
        requires_php: '5.5',
      })
  )
  .expectBadge({
    label: 'wordpress',
    message: 'not set for this plugin',
  })

t.create('Plugin Required WP Version | Not Found')
  .get('/plugin/wp-version/100.json')
  .expectBadge({
    label: 'wordpress',
    message: 'not found',
  })

t.create('Theme Required WP Version | Not Found')
  .get('/theme/wp-version/100.json')
  .expectBadge({
    label: 'wordpress',
    message: 'not found',
  })

t.create('Plugin Tested WP Version | Not Found')
  .get('/plugin/tested/100.json')
  .expectBadge({
    label: 'wordpress',
    message: 'not found',
  })

t.create('Plugin Tested WP Version (Alias)')
  .get('/v/100.svg')
  .expectRedirect('/wordpress/plugin/tested/100.svg')

t.create('Plugin Required PHP Version')
  .get('/plugin/required-php/jetpack.json')
  .expectBadge({
    label: 'php',
    message: isComposerVersion,
  })

t.create('Plugin Required PHP Version (Not Set)')
  .get('/plugin/required-php/akismet.json')
  .expectBadge({
    label: 'php',
    message: 'not set for this plugin',
  })

t.create('Theme Required PHP Version')
  .get('/theme/required-php/twentytwenty.json')
  .expectBadge({
    label: 'php',
    message: isComposerVersion,
  })

t.create('Theme Required PHP Version (Not Set)')
  .get('/theme/required-php/generatepress.json')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/themes/info/1.2/')
      .query({
        action: 'theme_information',
        request: {
          slug: 'generatepress',
          fields: mockedQueryFields,
        },
      })
      .reply(200, {
        version: '1.2',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: '4.0',
        tested: '4.0.0',
        requires_php: false,
        last_updated: '2020-01-01',
      })
  )
  .expectBadge({
    label: 'php',
    message: 'not set for this theme',
  })
