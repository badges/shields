'use strict'

const { test, given } = require('sazerac')
const { metric } = require('../text-formatters')
const WaffleLabel = require('./waffle-label.service')

const fakeData = [
  {
    label: null,
    count: 20,
  },
  {
    count: 10,
  },
  {
    label: {
      color: 'c5def5',
      name: 'feature',
    },
    count: 3,
  },
  {
    label: {
      name: 'bug',
      color: 'fbca04',
    },
    count: 5,
  },
]

describe('WaffleLabel', function() {
  test(WaffleLabel.render, () => {
    given({ count: 'absent' }).expect({ message: 'absent' })
    given({ count: 0, label: 'feature' }).expect({
      message: '0',
      color: '78bdf2',
      label: 'feature',
    })
    given({ count: 1007, color: 'fbca04', label: 'bug' }).expect({
      message: metric(1007),
      color: 'fbca04',
      label: 'bug',
    })
    given({ count: 123, label: 'task' }).expect({
      message: metric(123),
      color: '78bdf2',
      label: 'task',
    })
  })

  test(WaffleLabel.prototype.transform, () => {
    given({ json: [] }).expect({ count: 'absent' })
    given({ json: fakeData, label: 'not-there' }).expect({ count: 0 })
    given({ json: fakeData, label: 'bug' }).expect({
      count: 5,
      color: 'fbca04',
    })
  })
})
