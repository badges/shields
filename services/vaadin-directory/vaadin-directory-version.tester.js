import {isSemver} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('latest version of the component (can have v prefixed or without)')
  .get('/v/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'vaadin directory',
    message: isSemver,
  })

t.create('latest version of the component (can have v prefixed or without)')
  .get('/version/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'vaadin directory',
    message: isSemver,
  })

t.create('not found').get('/v/does-not-exist.json').expectBadge({
  label: 'vaadin directory',
  message: 'not found',
})
