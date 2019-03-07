'use strict'

const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const { renderColorStatusBadge } = require('./color-matcher')

test(renderColorStatusBadge, () => {
  given({ label: 'build', status: '#007a70' }).expect({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })
  given({ label: 'build', status: '#f1c40f' }).expect({
    label: 'build',
    message: 'building',
    color: 'orange',
  })
  given({ label: 'build', status: '#e74c3c' }).expect({
    label: 'build',
    message: 'failing',
    color: 'red',
  })
})

test(renderColorStatusBadge, () => {
  forCases([given({ status: '#1abc9c' }), given({ status: '#27ae60' })]).assert(
    'should be brightgreen',
    b => expect(b).to.include({ color: 'brightgreen' })
  )
})

test(renderColorStatusBadge, () => {
  forCases([given({ status: '#e74c3c' }), given({ status: '#ff0000' })]).assert(
    'should be red',
    b => expect(b).to.include({ color: 'red' })
  )
})

test(renderColorStatusBadge, () => {
  forCases([given({ status: '#f1c40f' }), given({ status: '#f39c12' })]).assert(
    'should be orange',
    b => expect(b).to.include({ color: 'orange' })
  )
})
