'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
    isStarRating
  } = require('./helpers/validators');
  
const t = new ServiceTester({ id: 'redmine', title: 'Redmine' });
module.exports = t;

t.create('plugin rating')
  .get('/plugins/redmine_xlsx_format_issue_exporter/rating.json')
  .intercept(nock => nock('http://www.redmine.org')
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
.get('/plugins/redmine_xlsx_format_issue_exporter/stars.json')
.intercept(nock => nock('http://www.redmine.org')
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
  .get('/plugins/plugin_not_found/rating.json')
  .intercept(nock => nock('http://www.redmine.org')
    .get('/plugins/plugin_not_found.xml')
    .reply(404, '')
  )
  .expectJSONTypes(Joi.object().keys({
    name: 'rating',
    value: 'invalid'
  }));

t.create('connection error')
  .get('/plugins/redmine_xlsx_format_issue_exporter/rating.json')
  .networkOff()
  .expectJSON({
      name: 'rating',
      value: 'inaccessible'
  });
