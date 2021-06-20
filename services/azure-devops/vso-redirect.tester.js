import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'vso',
  title: 'VSO',
})

t.create('Build: default branch')
  .get('/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2.svg')
  .expectRedirect(
    '/azure-devops/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2.svg'
  )

t.create('Build: named branch')
  .get('/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2/master.svg')
  .expectRedirect(
    '/azure-devops/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2/master.svg'
  )

t.create('Release status')
  .get('/release/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/1.svg')
  .expectRedirect(
    '/azure-devops/release/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/1.svg'
  )
