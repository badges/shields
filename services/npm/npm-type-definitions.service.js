'use strict';

const NpmVersion = require('./npm-version');
const NpmLicense = require('./npm-license');
const NpmDownloads = require('./npm-downloads');
const NpmTypeDefinitions = require('./npm-type-definitions');

module.exports = [
  NpmVersion,
  NpmLicense,
  NpmTypeDefinitions,
].concat(NpmDownloads);
