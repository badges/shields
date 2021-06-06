import {deprecatedService} from '../index.js';

const commonAttrs = {
  category: 'funding',
  label: 'gratipay',
  dateAdded: new Date('2017-12-29'),
}

export default [
  deprecatedService({
    route: {
      base: 'gittip',
      pattern: ':various*',
    },
    ...commonAttrs,
  }),
  deprecatedService({
    route: {
      base: 'gratipay',
      pattern: ':various*',
    },
    ...commonAttrs,
  }),
];
