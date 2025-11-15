import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'dockercloudbuild',
  title: 'DockerCloudBuild',
  pathPrefix: '/docker/cloud/build',
})

t.create('docker cloud build status').get('/pavics/magpie.json').expectBadge({
  label: 'dockercloud',
  message: 'no longer available',
})
