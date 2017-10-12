// Generate a JSON file from try.html with the initial badge example data.
'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const inputPath = path.join(__dirname, '..', 'try.html');
const html = fs.readFileSync(inputPath);

const $ = cheerio.load(html);

const sectionHeaders = $('h3');

const sections = [];

$('table.badge').each((i, table) => {
  const sectionName = sectionHeaders.eq(i).text().trim();
  const sectionId = sectionHeaders.eq(i).attr('id');
  const badges = [];

  $(table).find('tr').each((i, row) => {
    const th = $(row).find('th');
    const keywordsAttr = th.attr('data-keywords');
    const rowData = {
      title: th.text().trim().replace(/:$/, ''),
      previewBadgeUri: $(row).find('img').attr('src'),
      exampleBadgeUri: $(row).find('code').text(),
      keywords: keywordsAttr ? keywordsAttr.split(' ') : undefined,
      documentation: th.attr('data-doc'),
    };
    badges.push(rowData);
  })

  sections.push({ sectionId, sectionName, badges });
})

const outputPath = path.join(__dirname, '..', 'all-badges.json');
fs.writeFileSync(outputPath, JSON.stringify(sections, 0, 2));
