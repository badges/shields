import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'dockercloudautomated',
  title: 'DockerCloudAutomated',
  pathPrefix: '/docker/cloud/automated',
})

t.create('docker cloud automated build')
  .get('/pavics/magpie.json')
  .expectBadge({
    label: 'dockercloud',
    message: 'no longer available',
  })
