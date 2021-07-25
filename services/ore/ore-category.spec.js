import { test, forCases, given } from 'sazerac'
import OreCategory from './ore-category.service.js'

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
