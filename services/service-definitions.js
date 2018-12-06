'use strict'

const Joi = require('joi')

const arrayOfStrings = Joi.array()
  .items(Joi.string())
  .allow([])
  .required()

const objectOfKeyValues = Joi.object()
  .pattern(/./, Joi.string().allow(null))
  .required()

const staticBadgeContent = Joi.object({
  label: Joi.string(),
  message: Joi.string().required(),
  color: Joi.string().required(),
})

const serviceDefinition = Joi.object({
  category: Joi.string().required(),
  name: Joi.string().required(),
  isDeprecated: Joi.boolean().required(),
  route: Joi.alternatives().try(
    Joi.object({
      pattern: Joi.string().required(),
      queryParams: arrayOfStrings,
    }),
    Joi.object({
      format: Joi.string().required(),
      queryParams: arrayOfStrings,
    })
  ),
  examples: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        example: Joi.alternatives()
          .try(
            Joi.object({
              pattern: Joi.string(),
              namedParams: objectOfKeyValues,
              queryParams: objectOfKeyValues,
            }),
            Joi.object({
              path: Joi.string().required(), // URL convertible.
              queryParams: objectOfKeyValues,
            })
          )
          .required(),
        preview: Joi.alternatives()
          .try(
            staticBadgeContent,
            Joi.object({
              path: Joi.string().required(), // URL convertible.
              queryParams: objectOfKeyValues,
            })
          )
          .required(),
        keywords: arrayOfStrings,
        documentation: Joi.string(), // Valid HTML.
      })
    )
    .default([]),
}).required()

function assertValidServiceDefinition(example, message = undefined) {
  Joi.assert(example, serviceDefinition, message)
}

const serviceDefinitionExport = Joi.object({
  schemaVersion: Joi.equal('0').required(),
  categories: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
      })
    )
    .required(),
  services: Joi.array()
    .items(serviceDefinition)
    .required(),
}).required()

function assertValidServiceDefinitionExport(examples, message = undefined) {
  Joi.assert(examples, serviceDefinitionExport, message)
}

module.exports = {
  serviceDefinition,
  assertValidServiceDefinition,
  serviceDefinitionExport,
  assertValidServiceDefinitionExport,
}
