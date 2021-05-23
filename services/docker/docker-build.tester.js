import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

const t = (module.exports = new ServiceTester({
  id: 'dockerbuild',
  title: 'DockerBuild',
  pathPrefix: '/docker/build',
}))

t.create('no longer available').get('/jrottenberg/ffmpeg.json').expectBadge({
  label: 'docker build',
  message: 'no longer available',
})
