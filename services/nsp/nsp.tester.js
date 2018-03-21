'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = new ServiceTester({id: 'nsp', title: 'Node Security Platform'})

const formats = {
  A: '/nsp/npm/:package.:format',
  B: '/nsp/npm/:package/:version.:format',
  C: '/nsp/npm/@:scope/:package.:format',
  D: '/nsp/npm/@:scope/:package/:version.:format'
}

const noExistPackages = {
  A: '/npm/some-no-exist.json',
  B: '/npm/some-no-exist/1.0.0.json',
  C: '/npm/@some-no-exist/some-no-exist.json',
  D: '/npm/@some-no-exist/some-no-exist/1.0.0.json'
}

const withoutVulnerabilities = {
  A: '/npm/bronze.json',
  B: '/npm/bronze/1.4.0.json',
  C: '/npm/@cycle/core.json',
  D: '/npm/@cycle/core/1.0.0.json'
}

const withVulnerabilities = {
  A: '/npm/nodeaaaaa.json',
  B: '/npm/express/1.0.0.json'
}

Object.keys(formats).forEach(format => {
  const noExist = noExistPackages[format]
  const withVulnerability = withVulnerabilities[format]
  const withoutVulnerability = withoutVulnerabilities[format]

  if (typeof noExist === 'string') {
    t.create(`Format '${formats[format]}' where it doesn't exist`)
      .get(noExist)
      .expectJSON({name: 'nsp', value: 'no known vulnerabilities'})
  }

  if (typeof withVulnerability === 'string') {
    t.create(`Format '${formats[format]}' with vulnerabilities`)
      .get(withVulnerability)
      .expectJSONTypes(Joi.object().keys({name: 'nsp', value: Joi.string().regex(/^[0-9]+ vulnerabilities$/)}))
  }

  if (typeof withoutVulnerability === 'string') {
    t.create(`Format '${formats[format]}' without vulnerabilities`)
      .get(withoutVulnerability)
      .expectJSON({name: 'nsp', value: 'no known vulnerabilities'})
  }
})

module.exports = t
