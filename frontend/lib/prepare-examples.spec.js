import { test, given, forCases } from 'sazerac';
import { predicateFromQuery } from './prepare-examples';

describe('Badge example functions', function() {
  const exampleMatchesQuery =
    (example, query) => predicateFromQuery(query)(example);

  test(exampleMatchesQuery, () => {
    forCases([
      given({ title: 'node version' }, 'npm'),
    ]).expect(false);

    forCases([
      given({ title: 'node version', keywords: ['npm'] }, 'node'),
      given({ title: 'node version', keywords: ['npm'] }, 'npm'),
      // https://github.com/badges/shields/issues/1578
      given({ title: 'c++ is the best language' }, 'c++'),
    ]).expect(true);
  });
});
