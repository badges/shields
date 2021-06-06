import {deprecatedService} from '../index.js';

export default deprecatedService({
  route: {
    base: 'waffle/label',
    pattern: ':various*',
  },
  label: 'waffle',
  category: 'issue-tracking',
  dateAdded: new Date('2019-05-21'),
});
