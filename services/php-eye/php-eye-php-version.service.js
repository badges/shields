import {deprecatedService} from '..';

export default [
  deprecatedService({
    category: 'platform-support',
    label: 'php tested',
    route: {
      base: 'php-eye',
      pattern: ':various*',
    },
    dateAdded: new Date('2018-04-20'),
  }),
];
