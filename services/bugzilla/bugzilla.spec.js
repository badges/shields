import { test, given } from 'sazerac'
import Bugzilla from './bugzilla.service.js'

describe('getDisplayStatus function', function () {
  it('formats status correctly', async function () {
    test(Bugzilla.getDisplayStatus, () => {
      given({ status: 'RESOLVED', resolution: 'WORKSFORME' }).expect(
        'works for me'
      )
      given({ status: 'RESOLVED', resolution: 'WONTFIX' }).expect("won't fix")
      given({ status: 'ASSIGNED', resolution: '' }).expect('assigned')
    })
  })
})
