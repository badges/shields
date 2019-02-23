'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('No URL specified')
  .get('.json?query=$.name&label=Package Name&style=_shields_test')
  .expectJSON({
    name: 'Package Name',
    value: 'invalid query parameter: url',
    color: 'red',
  })

t.create('No query specified')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&label=Package Name&style=_shields_test'
  )
  .expectJSON({
    name: 'Package Name',
    value: 'invalid query parameter: query',
    color: 'red',
  })

t.create('YAML from url')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&query=$.name&style=_shields_test'
  )
  .expectJSON({
    name: 'custom badge',
    value: 'coredns',
    color: 'blue',
  })

t.create('YAML from uri (support uri query parameter)')
  .get(
    '.json?uri=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&query=$.name&style=_shields_test'
  )
  .expectJSON({
    name: 'custom badge',
    value: 'coredns',
    color: 'blue',
  })

t.create('YAML from url | multiple results')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&query=$..keywords[0:2:1]'
  )
  .expectJSON({ name: 'custom badge', value: 'coredns, dns' })

t.create('YAML from url | caching with new query params')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&query=$.version'
  )
  .expectJSON({ name: 'custom badge', value: '0.8.0' })

t.create('YAML from url | with prefix & suffix & label')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&query=$.version&prefix=v&suffix= dev&label=Shields'
  )
  .expectJSON({ name: 'Shields', value: 'v0.8.0 dev' })

t.create('YAML from url | object doesnt exist')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&query=$.does_not_exist&style=_shields_test'
  )
  .expectJSON({
    name: 'custom badge',
    value: 'no result',
    color: 'lightgrey',
  })

t.create('YAML from url | invalid url')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/notafile.yaml&query=$.version&style=_shields_test'
  )
  .expectJSON({
    name: 'custom badge',
    value: 'resource not found',
    color: 'red',
  })

t.create('YAML from url | user color overrides default')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/Chart.yaml&query=$.name&color=10ADED&style=_shields_test'
  )
  .expectJSON({ name: 'custom badge', value: 'coredns', color: '#10aded' })

t.create('YAML from url | error color overrides default')
  .get(
    '.json?url=https://raw.githubusercontent.com/kubernetes/charts/568291d6e476c39ca8322c30c3f601d0383d4760/stable/coredns/notafile.yaml&query=$.version&style=_shields_test'
  )
  .expectJSON({
    name: 'custom badge',
    value: 'resource not found',
    color: 'red',
  })

t.create('YAML from url | error color overrides user specified')
  .get('.json?query=$.version&color=10ADED&style=_shields_test')
  .expectJSON({
    name: 'custom badge',
    value: 'invalid query parameter: url',
    color: 'red',
  })
