import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'requires',
  title: 'Requires.io',
})

t.create('no longer available (previously Bitbucket without branch)')
  .get('/bitbucket/code-orange/django-ispstack.json')
  .expectBadge({
    label: 'requirements',
    message: 'no longer available',
  })

t.create('no longer available (previously GitHub with branch)')
  .get('/github/Hongbo-Miao/hongbomiao.com/main.json')
  .expectBadge({
    label: 'requirements',
    message: 'no longer available',
  })
