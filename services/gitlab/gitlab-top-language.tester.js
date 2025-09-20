import { createServiceTester } from '../tester.js'
import { isDecimalPercentage } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Valid Repository').get('/wireshark/wireshark.json').expectBadge({
  label: 'c',
  message: isDecimalPercentage,
})

t.create('Valid Blank Repo')
  .get('/KoruptTinker/gitlab-blank-repo.json')
  .expectBadge({
    label: 'language',
    message: 'no languages found',
  })

t.create('Invalid Repository')
  .get('/wireshark/invalidexample.json')
  .expectBadge({
    label: 'language',
    message: 'project not found',
  })
