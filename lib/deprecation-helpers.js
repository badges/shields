'use strict';

const { makeBadgeData } = require('./badge-data');

const deprecatedServices = {
  'gittip': new Date('2017-12-29'),
  'gratipay': new Date('2017-12-29'),
  'gemnasium': new Date('2018-05-15'),
  'snap': new Date('2018-01-23'),
  'snap-ci': new Date('2018-01-23'),
  'cauditor': new Date('2018-02-15'),
};

const isDeprecated = function (service, now=new Date(), depServices=deprecatedServices) {
  if (!(service in depServices)) {
    return false;
  }
  return now.getTime() >= depServices[service].getTime();
};

const getDeprecatedBadge = function (label, data) {
  const badgeData = makeBadgeData(label, data);
  badgeData.colorscheme = 'lightgray';
  badgeData.text[1] = 'no longer available';
  return badgeData;
};

module.exports = {
  isDeprecated,
  getDeprecatedBadge,
};
