'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isIntegerPercentage,
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'sonar', title: 'SonarQube' });
module.exports = t;

t.create('Tech Debt')
  .get('/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'tech debt',
    value: isIntegerPercentage
  }));

t.create('Coverage')
  .get('/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage
  }));

t.create('Tech Debt (legacy API supported)')
  .get('/4.2/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/tech_debt.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'tech debt',
    value: isIntegerPercentage
  }));

t.create('Coverage (legacy API supported)')
  .get('/4.2/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/coverage.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage
  }));

t.create('Tech Debt (legacy API unsupported)')
  .get('/4.2/http/sonarqube.com/com.github.dannil:scb-java-client/tech_debt.json')
  .expectJSON({ name: 'tech debt', value: 'invalid' });

t.create('Coverage (legacy API unsupported)')
  .get('/4.2/http/sonarqube.com/com.github.dannil:scb-java-client/coverage.json')
  .expectJSON({ name: 'coverage', value: 'invalid' });
