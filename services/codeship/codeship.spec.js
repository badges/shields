import { test, given } from 'sazerac'
import Codeship from './codeship.service.js'

const pending = { message: 'pending', label: undefined, color: undefined }
const notBuilt = { message: 'not built', label: undefined, color: undefined }

describe('Codeship', function () {
  test(Codeship.render, () => {
    given({ status: 'testing' }).expect(pending)
    given({ status: 'waiting' }).expect(pending)
    given({ status: 'initiated' }).expect(pending)
    given({ status: 'stopped' }).expect(notBuilt)
    given({ status: 'ignored' }).expect(notBuilt)
    given({ status: 'blocked' }).expect(notBuilt)
    given({ status: 'infrastructure_failure' }).expect({
      message: 'failing',
      color: 'red',
      label: undefined,
    })
  })
})
