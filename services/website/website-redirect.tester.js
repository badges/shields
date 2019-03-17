'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'WebsiteRedirect',
  title: 'WebsiteRedirect',
  pathPrefix: '',
}))

t.create('Website with custom messages')
  .get('/website-up-down/https/www.google.com.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/website/https/www.google.com.svg?down_message=down&up_message=up'
  )

t.create('Website with custom messages and colors')
  .get('/website-up-down-yellow-gray/https/www.google.com.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/website/https/www.google.com.svg?down_color=gray&down_message=down&up_color=yellow&up_message=up'
  )
