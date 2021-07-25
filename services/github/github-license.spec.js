import { test, given } from 'sazerac'
import GithubLicense from './github-license.service.js'

test(GithubLicense.render, () => {
  given({ license: undefined }).expect({ message: 'not specified' })
  given({ license: 'NOASSERTION' }).expect({
    message: 'not identifiable by github',
  })
  given({ license: 'MIT' }).expect({ message: 'MIT', color: 'green' })
})
