import { test, given } from 'sazerac';
import { encodeField, default as staticBadgeUri } from './static-badge-uri';

describe('Static badge URI generator', function() {
  test(encodeField, () => {
    given('foo').expect('foo');
    given('').expect('');
    given('happy go lucky').expect('happy%20go%20lucky');
    given('do-right').expect('do--right');
    given('it_is_a_snake').expect('it__is__a__snake');
  });

  test(staticBadgeUri, () => {
    given('http://img.example.com', 'foo', 'bar', 'blue', { style: 'plastic'})
      .expect('http://img.example.com/badge/foo-bar-blue.svg?style=plastic');
  });
});
