'use strict';

const Joi = require('joi');
const semverRegex = require('semver-regex')();

const withRegex = (re) => Joi.string().regex(re);

const isSemver = withRegex(semverRegex);

const isVPlusTripleDottedVersion = withRegex(/^v[0-9]+.[0-9]+.[0-9]+$/);

const isVPlusDottedVersionAtLeastOne = withRegex(/^v\d+(\.\d+)?(\.\d+)?$/);

const isStarRating = withRegex(/^[\u2605\u2606]{5}$/);

const isMetric = withRegex(/^[0-9]+[kMGTPEZY]?$/);

const isPercentage = withRegex(/^[0-9]+%$/);

const isFileSize = withRegex(/^[0-9]*[.]?[0-9]+\s(B|kB|MB|GB|TB|PB|EB|ZB|YB)$/);

const isFormattedDate = Joi.alternatives().try(
  Joi.equal('today', 'yesterday'),
  Joi.string().regex(/^last (sun|mon|tues|wednes|thurs|fri|satur)day$/),
  Joi.string().regex(/^(january|february|march|april|may|june|july|august|september|october|november|december)( \d{4})?$/));

module.exports = {
  isSemver,
  isVPlusTripleDottedVersion,
  isVPlusDottedVersionAtLeastOne,
  isStarRating,
  isMetric,
  isPercentage,
  isFileSize,
  isFormattedDate
};
