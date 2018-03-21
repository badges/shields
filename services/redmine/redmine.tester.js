'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
    isStarRating
  } = require('../test-validators');
  
const t = new ServiceTester({ id: 'redmine', title: 'Redmine' });
module.exports = t;

t.create('plugin rating')
  .get('/plugin/rating/redmine_xlsx_format_issue_exporter.json')
  .intercept(nock => nock('https://www.redmine.org')
    .get('/plugins/redmine_xlsx_format_issue_exporter.xml')
    .reply(200,
        '<redmine-plugin>' + 
            '<ratings-average type="float">1.23456</ratings-average>' +
        '</redmine-plugin>'
    )
  )
  .expectJSONTypes(Joi.object().keys({
    name: 'rating',
    value: Joi.string().regex(/^[0-9]+\.[0-9]+\/5\.0$/)
  }));

t.create('plugin stars')
.get('/plugin/stars/redmine_xlsx_format_issue_exporter.json')
.intercept(nock => nock('https://www.redmine.org')
  .get('/plugins/redmine_xlsx_format_issue_exporter.xml')
  .reply(200,
      '<redmine-plugin>' + 
          '<ratings-average type="float">1.23456</ratings-average>' +
      '</redmine-plugin>'
  )
)
.expectJSONTypes(Joi.object().keys({
  name: 'stars',
  value: isStarRating
}));

t.create('plugin not found')
  .get('/plugin/rating/plugin_not_found.json')
  .intercept(nock => nock('https://www.redmine.org')
    .get('/plugins/plugin_not_found.xml')
    .reply(404, '')
  )
  .expectJSONTypes(Joi.object().keys({
    name: 'rating',
    value: 'invalid'
  }));

t.create('connection error')
  .get('/plugin/rating/redmine_xlsx_format_issue_exporter.json')
  .networkOff()
  .expectJSON({
      name: 'rating',
      value: 'inaccessible'
  });
