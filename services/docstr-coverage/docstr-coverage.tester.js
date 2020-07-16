'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isIntegerPercentage } = require('../test-validators')

t.create('Coverage (valid)')
  .get('/fabiosangregorio/telereddit/docs.yml/master.json')
  .expectBadge({
    label: "docstr-coverage",
    message: isIntegerPercentage
  })

t.create('Coverage without branch (valid)')
  .get('/fabiosangregorio/telereddit/docs.yml.json')
  .expectBadge({
    label: "docstr-coverage",
    message: isIntegerPercentage
  })

t.create('Coverage with non existing workflow (not valid)')
  .get('/fabiosangregorio/telereddit/aaaaaa.yml.json')
  .expectBadge({
    label: "docstr-coverage",
    message: "workflow not found"
  })

t.create('Coverage with non existing branch (not valid)')
  .get('/fabiosangregorio/telereddit/docs.yml/aaaaa.json')
  .expectBadge({
    label: "docstr-coverage",
    message: "branch not found"
  })

t.create('Coverage with non existing artifact (not valid)')
  .get('/fabiosangregorio/telereddit/test.yml.json')
  .expectBadge({
    label: "docstr-coverage",
    message: "artifact not found"
  })