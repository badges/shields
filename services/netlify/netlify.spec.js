'use strict'

const { test, given } = require('sazerac')
const Netlify = require('./netlify.service')

const passing = { message: 'passing', label: undefined, color: 'brightgreen' }
const building = { message: 'building', label: undefined, color: 'orange' }
const failing = { message: 'failing', label: undefined, color: 'red' }

describe('Netlify', function() {
  test(Netlify.render, () => {
    given({ status: 'passing' }).expect(passing)
    given({ status: 'netlify-building' }).expect(building)
    given({ status: 'failing' }).expect(failing)
  })
})
