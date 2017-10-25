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
  const category = {
    id: sectionHeaders.eq(i).attr('id'),
    name: sectionHeaders.eq(i).text().trim(),
  };

  const examples = [];

  $(table).find('tr').each((i, row) => {
    const th = $(row).find('th');
    const keywordsAttr = th.attr('data-keywords');

    const previewUri = $(row).find('img').attr('src');
    const exampleUri = $(row).find('code').text().replace(/^https:\/\/img\.shields\.io/, '');

    const rowData = {
      title: th.text().trim().replace(/:$/, ''),
      previewUri,
      keywords: keywordsAttr ? keywordsAttr.split(' ') : undefined,
      documentation: th.attr('data-doc'),
    };

    if (exampleUri !== previewUri) {
      rowData.exampleUri = exampleUri;
    }

    examples.push(rowData);
  })

  sections.push({ category, examples });
})

const outputPath = path.join(__dirname, '..', 'all-badges.json');
fs.writeFileSync(outputPath, JSON.stringify(sections, 0, 2));
