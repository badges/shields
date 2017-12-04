import { test, given, forCases } from 'sazerac';
import resolveUrl from './resolve-url';

describe('URL resolver', function() {
  test(resolveUrl, () => {
    forCases([
      given('/foo/bar'),
      given('/foo/bar', '/'),
      given('/foo/bar', '/baz'),
      given('/foo/bar', '/baz/'),
      given('/foo/bar', ''),
      given('/foo/bar', undefined),
    ]).expect('/foo/bar')

    given('foo/bar', '/baz/').expect('/baz/foo/bar')

    forCases([
      given('http://foo/bar'),
      given('bar', 'http://foo/'),
      given('/bar', 'http://foo/'),
    ]).expect('http://foo/bar')

    given('/foo/bar', '/baz', { baz: 'bazinga' })
      .expect('/foo/bar?baz=bazinga');
  })
});
