import {deprecatedService} from '../index.js';

export default deprecatedService({
  category: 'build',
  route: {
    base: 'dockbit',
    pattern: ':various+',
  },
  label: 'dockbit',
  dateAdded: new Date('2017-12-31'),
});
