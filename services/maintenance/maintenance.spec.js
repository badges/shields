import { test, given } from 'sazerac'
import Maintenance from './maintenance.service.js'

describe('Maintenance', function () {
  test(Maintenance.prototype.transform, () => {
    given({
      maintained: 'no',
      currentYear: 2017,
      year: 2018,
    }).expect({
      isMaintained: false,
      targetYear: 2018,
    })
    given({
      maintained: 'yes',
      year: 2020,
      currentYear: 2019,
    }).expect({
      isMaintained: true,
    })
    given({
      maintained: 'yes',
      year: 2018,
      currentYear: 2019,
      month: 2,
    }).expect({
      isStale: true,
      targetYear: 2019,
    })
    given({
      maintained: 'yes',
      year: 2018,
      currentYear: 2019,
      month: 3,
    }).expect({
      isMaintained: false,
      targetYear: 2018,
    })
    given({
      maintained: 'yes',
      year: 2018,
      currentYear: 2020,
    }).expect({
      isMaintained: false,
      targetYear: 2018,
    })
  })

  test(Maintenance.render, () => {
    given({ isMaintained: true, message: 'yes' }).expect({
      message: 'yes',
      color: 'brightgreen',
    })
    given({ isMaintained: false, targetYear: 2018 }).expect({
      message: 'no! (as of 2018)',
      color: 'red',
    })
    given({ isMaintained: false, isStale: true, targetYear: 2018 }).expect({
      message: 'stale (as of 2018)',
      color: undefined,
    })
  })
})
