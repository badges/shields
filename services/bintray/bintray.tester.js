import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('no longer available (previously downloads)')
  .get('/dt/asciidoctor/maven/asciidoctorj.json')
  .expectBadge({
    label: 'bintray',
    message: 'no longer available',
  })

t.create('no longer available (previously version)')
  .get('/v/asciidoctor/maven/asciidoctorj.json')
  .expectBadge({
    label: 'bintray',
    message: 'no longer available',
  })
