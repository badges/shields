'use strict'

const { test, forCases, given } = require('sazerac')
const OreCategory = require('./ore-category.service')

describe('OreCategory', function () {
  test(OreCategory.prototype.transform, () => {
    forCases([
      given({ data: { category: 'admin_tools' } }),
      given({ data: { category: 'admin tools' } }),
    ]).expect({
      category: 'admin tools',
    })
  })

  test(OreCategory.render, () => {
    given({ category: 'admin tools' }).expect({
      message: 'admin tools',
    })
  })
})
