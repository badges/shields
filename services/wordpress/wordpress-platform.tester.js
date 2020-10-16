'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'WordpressPlatform',
  title: 'WordPress Platform Tests',
  pathPrefix: '/wordpress',
}))

t.create('Plugin Required WP Version')
  .get('/plugin/wp-version/akismet.json')
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

const mockedQuerySelector = {
  action: 'plugin_information',
  request: {
    slug: 'akismet',
    fields: {
      active_installs: '1',
      sections: '0',
      homepage: '0',
      tags: '0',
      screenshot_url: '0',
      downloaded: 1,
    },
  },
}

const mockedCoreResponseData = {
  offers: [{ version: '4.9.8' }, { version: '4.9.6' }],
}

// const mockedThemeAuthor = {
//   user_nicename:"wordpressdotorg",
//   profile:"https://profiles.wordpress.org/wordpressdotorg",
//   avatar:"https://secure.gravatar.com/avatar/61ee2579b8905e62b4b4045bdc92c11a?s=96&d=monsterid&r=g",
//   display_name:"WordPress.org"
// }

const mockedPluginContributors = {
  matt: {
    profile: 'https://profiles.wordpress.org/matt',
    avatar:
      'http://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=monsterid&r=g',
    display_name: 'Matt Mullenweg',
  },
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
        author:
          '<a href="https://automattic.com/wordpress-plugins">Automattic</a>',
        author_profile: 'https://profiles.wordpress.org/automattic',
        contributors: mockedPluginContributors,
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
        author:
          '<a href="https://automattic.com/wordpress-plugins/">Automattic</a>',
        author_profile: 'https://profiles.wordpress.org/automattic',
        contributors: mockedPluginContributors,
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
        author:
          '<a href="https://automattic.com/wordpress-plugins/">Automattic</a>',
        author_profile: 'https://profiles.wordpress.org/automattic',
        contributors: mockedPluginContributors,
      })
      .get('/core/version-check/1.7/')
      .reply(200, mockedCoreResponseData)
  )
  .expectBadge({
    label: 'wordpress',
    message: 'v4.0.0 tested',
    color: 'yellow',
  })

t.create('Plugin Required WP Version | Not Found')
  .get('/plugin/wp-version/100.json')
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
