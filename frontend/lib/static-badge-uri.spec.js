import { test, given } from 'sazerac';
import { encodeField, staticBadgeUri } from './static-badge-uri';

describe('Static badge URI generator', function() {
  test(encodeField, () => {
    given('foo').expect('foo');
    given('').expect('');
    given('').expect('');
  });
});
