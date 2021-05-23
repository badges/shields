import {isFormattedDate} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('latest release date of the component (format: yyyy-mm-dd)')
  .get('/rd/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'latest release date',
    message: isFormattedDate,
  })

t.create('latest release date of the component (format: yyyy-mm-dd)')
  .get('/release-date/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'latest release date',
    message: isFormattedDate,
  })

t.create('not found')
  .get('/release-date/does-not-exist.json')
  .expectBadge({ label: 'latest release date', message: 'not found' })
