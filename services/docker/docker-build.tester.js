import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'dockerbuild',
  title: 'DockerBuild',
  pathPrefix: '/docker/build',
})

t.create('no longer available').get('/jrottenberg/ffmpeg.json').expectBadge({
  label: 'docker build',
  message: 'no longer available',
})
