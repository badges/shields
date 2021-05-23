import {deprecatedService} from '..';

export default deprecatedService({
  route: {
    base: 'coverity/ondemand',
    pattern: ':various+',
  },
  label: 'coverity',
  category: 'analysis',
  dateAdded: new Date('2018-12-18'),
});
