'use strict';

const glob = require('glob');

// Match modules with the same name as their containing directory.
// e.g. services/appveyor/appveyor.js
const serviceRegex = /\/services\/(.*)\/\1\.js$/;

function loadServiceClasses() {
  // New-style services
  return glob.sync(`${__dirname}/**/*.js`)
    .filter(path => serviceRegex.test(path))
    .map(path => require(path))
}

function loadTesters() {
  return glob.sync(`${__dirname}/**/*.tester.js`)
    .map(name => require(name));
}

module.exports = {
  loadServiceClasses,
  loadTesters,
};
