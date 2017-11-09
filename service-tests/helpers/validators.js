'use strict';

const Joi = require('joi');
const semverRegex = require('semver-regex')();

const withRegex = (re) => Joi.string().regex(re);

const isSemver = withRegex(semverRegex);

const isVPlusTripleDottedVersion = withRegex(/^v[0-9]+.[0-9]+.[0-9]+$/);

const isVPlusDottedVersionAtLeastOne = withRegex(/^v\d+(\.\d+)?(\.\d+)?$/);

const isRequireVersion = withRegex(/^\s*(([<>!]=?)|\^|~)\d+(\.\d+)?(\.\d+)?((\s*\|\|)?\s*(([<>!]=?)|\^|~)\d+(\.\d+)?(\.\d+)?)?\s*$/);

const isStarRating = withRegex(/^(?=.{5}$)(\u2605{0,5}[\u00BC\u00BD\u00BE]?\u2606{0,5})$/);

// Required to be > 0, beacuse accepting zero masks many problems.
const isMetric = withRegex(/^[1-9][0-9]*[kMGTPEZY]?$/);

const isMetricOverTimePeriod = withRegex(/^[1-9][0-9]*[kMGTPEZY]?\/(year|month|4 weeks|week|day)$/);

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
  isRequireVersion,
  isStarRating,
  isMetric,
  isMetricOverTimePeriod,
  isPercentage,
  isFileSize,
  isFormattedDate
};
