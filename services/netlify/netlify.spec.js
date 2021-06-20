import { test, given } from 'sazerac'
import Netlify from './netlify.service.js'

const building = { message: 'building', label: undefined, color: 'yellow' }
const notBuilt = { message: 'not built', label: undefined, color: undefined }

describe('Netlify', function () {
  test(Netlify.render, () => {
    given({ status: 'building' }).expect(building)
    given({ status: 'stopped' }).expect(notBuilt)
    given({ status: 'infrastructure_failure' }).expect({
      message: 'failing',
      color: 'red',
      label: undefined,
    })
  })
})
