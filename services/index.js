'use strict';

const glob = require('glob');

// Match modules with the same name as their containing directory.
// e.g. services/appveyor/appveyor.js
const serviceRegex = /\/services\/(.*)\/\1\.js$/;

function loadServiceClasses() {
  // New-style services
  const services = glob.sync(`${__dirname}/**/*.js`)
    .filter(path => serviceRegex.test(path))
    .map(path => require(path));

  const serviceClasses = [];
  services.forEach(service => {
    if (typeof service === 'function') {
      serviceClasses.push(service);
    } else {
      for (const serviceClass in service) {
        serviceClasses.push(service[serviceClass]);
      }
    }
  });

  return serviceClasses;
}

function loadTesters() {
  return glob.sync(`${__dirname}/**/*.tester.js`)
    .map(path => require(path));
}

module.exports = {
  loadServiceClasses,
  loadTesters,
};
