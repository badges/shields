'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

const mockResponse = {
  results: [
    {
      extensions: [
        {
          statistics: [
            {
              statisticName: 'install',
              value: 21,
            },
            {
              statisticName: 'onpremDownloads',
              value: 7,
            },
          ],
          versions: [
            {
              version: '1.0.0',
            },
          ],
        },
      ],
    },
  ],
}

t.create('live: Azure DevOps Extension total installs')
  .get('/total/swellaby.mirror-git-repository.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: isMetric,
    })
  )

t.create('live: Azure DevOps Extension services installs')
  .get('/services/swellaby.mirror-git-repository.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: isMetric,
    })
  )

t.create('live: invalid extension id')
  .get('/services/badges-shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: 'invalid extension id',
    })
  )

t.create('live: non existent extension')
  .get('/total/badges.shields-io-fake.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: 'extension not found',
    })
  )

t.create('total installs')
  .get('/total/swellaby.cobertura-transform.json?style=_shields_test')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectJSON({
    name: 'installs',
    value: '28',
    color: 'yellowgreen',
  })

t.create('services installs')
  .get('/services/swellaby.cobertura-transform.json?style=_shields_test')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectJSON({
    name: 'installs',
    value: '21',
    color: 'yellowgreen',
  })

t.create('onprem installs')
  .get('/onprem/swellaby.cobertura-transform.json?style=_shields_test')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, mockResponse)
  )
  .expectJSON({
    name: 'installs',
    value: '7',
    color: 'yellow',
  })

t.create('zero installs')
  .get('/total/swellaby.cobertura-transform.json?style=_shields_test')
  .intercept(nock =>
    nock('https://marketplace.visualstudio.com/_apis/public/gallery/')
      .post(`/extensionquery/`)
      .reply(200, {
        results: [
          {
            extensions: [
              {
                statistics: [],
                versions: [
                  {
                    version: '1.0.0',
                  },
                ],
              },
            ],
          },
        ],
      })
  )
  .expectJSON({
    name: 'installs',
    value: '0',
    color: 'red',
  })
