import {isPhpVersionReduction} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('gets the package version of symfony 5.1')
  .get('/symfony/symfony/5.1.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('gets the package version of yii')
  .get('/yiisoft/yii/master.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('gets the package version of pagination-bundle')
  .get('/gpslab/pagination-bundle/master.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('invalid package name')
  .get('/frodo/is-not-a-package/master.json')
  .expectBadge({ label: 'php', message: 'repo not found' })
