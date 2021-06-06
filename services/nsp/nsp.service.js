import {deprecatedService} from '../index.js';

export default deprecatedService({
  route: {
    base: 'nsp/npm',
    pattern: ':various*',
  },
  label: 'nsp',
  category: 'other',
  dateAdded: new Date('2018-12-13'),
});
