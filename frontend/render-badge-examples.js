'use strict';

const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const pretty = require('pretty');
const BadgeExamples = require('./badge-examples');

// const inputPath = path.join(__dirname, '..', 'all-badges.json');
// const badgeExampleData = JSON.parse(fs.readFileSync(inputPath));
const badgeExampleData = require('../lib/all-badge-examples');

const fragment = ReactDOMServer.renderToStaticMarkup(
  <BadgeExamples examples={badgeExampleData} />);

const outputPath = path.join(__dirname, '..', 'build', 'badge-examples-fragment.html');
fs.writeFileSync(outputPath, pretty(fragment));
