'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'waffle', title: 'Waffle.io' });
module.exports = t;


const fakeData = [
  {
    githubMetadata: {
      labels: [
                { color: 'c5def5', name: 'feature' },
                { color: 'fbca04', name: 'bug' },
                { color: 'e11d21', name: 'bug' }
      ]
    }
  },
  {
    githubMetadata: {
      labels: [
                { color: 'c5def5', name: 'feature' },
                { color: 'fbca04', name: 'bug' },
                { color: 'e11d21', name: 'feature' }
      ]
    }
  },
  {
    githubMetadata: {
      labels: [
                { color: 'c5def5', name: 'bug' },
                { color: 'fbca04', name: 'bug' }
      ]
    }
  },
];

t.create('label should be `bug` & value should be exactly 5 as supplied in `fakeData`.  e.g: bug|5')
    .get('/label/userName/repoName/bug.json')
    .intercept(nock => nock('https://api.waffle.io/')
        .get('/userName/repoName/cards')
        .reply(200, fakeData))
    .expectJSON({ name: 'bug', value: '5' });

t.create('label should be `Mybug` & value should be formated.  e.g: Mybug|25')
    .get('/label/ritwickdey/vscode-live-server/bug.json?label=Mybug')
    .expectJSONTypes(Joi.object().keys({
      name: 'Mybug',
      value: Joi.string().regex(/^\d+$/)
    }));
