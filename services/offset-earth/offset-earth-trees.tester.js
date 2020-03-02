'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('request for existing profile')
  .timeout(10000)
  .get('/offsetearth.json')
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('request for existing profile (mock)')
  .get('/offsetearth.json')
  .intercept(nock =>
    nock('https://api.offset.earth')
      .get('/users/offsetearth/profile')
      .reply(200, {
        treeMonths: [
          {
            projects: [
              {
                trees: [
                  {
                    value: 50,
                  },
                ],
              },
            ],
          },
        ],
      })
  )
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('invalid profile (mock)')
  .get('/non-existent-username.json')
  .intercept(nock =>
    nock('https://api.offset.earth')
      .get('/users/non-existent-username/profile')
      .reply(404, {})
  )
  .expectBadge({ label: 'trees', message: 'profile not found' })
