import {deprecatedService} from '..';

export default [
  deprecatedService({
    category: 'platform-support',
    label: 'hhvm',
    route: {
      base: 'hhvm',
      pattern: ':various*',
    },
    dateAdded: new Date('2018-04-20'),
  }),
];
