'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

// Taken from https://ore.spongepowered.org/api#/Projects/showProject
const CATEGORY_ENUM = [
  'admin_tools',
  'chat',
  'dev_tools',
  'economy',
  'gameplay',
  'games',
  'protection',
  'role_playing',
  'world_management',
  'misc',
]

const isInCategoryEnum = Joi.string()
  .valid(...CATEGORY_ENUM.map(cat => cat.replace(/_/g, ' ')))
  .required()

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'category',
  message: isInCategoryEnum,
})

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'category',
  message: 'not found',
})
