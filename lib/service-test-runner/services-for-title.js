'use strict';

const difference = require('lodash.difference');

function servicesForTitle(title) {
  const bracketed = /\[([^\]]+)\]/g;

  const preNormalized = title.toLowerCase();

  let services = [];
  let match;
  while ((match = bracketed.exec(preNormalized))) {
    const [, bracketed] = match;
    services = services.concat(bracketed.split(' '));
  }

  const blacklist = ['wip', 'rfc'];
  return difference(services.map(service => service.toLowerCase()), blacklist);
}

module.exports = servicesForTitle;
