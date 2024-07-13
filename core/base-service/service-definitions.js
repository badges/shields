/**
 * @module
 */
import Joi from 'joi'

const arrayOfStrings = Joi.array().items(Joi.string()).min(0).required()

/**
 * Joi schema describing the subset of OpenAPI paths we use in this application
 *
 * @see https://swagger.io/specification/#paths-object
 */
const openApiSchema = Joi.object()
  .pattern(
    /./,
    Joi.object({
      get: Joi.object({
        summary: Joi.string().required(),
        description: Joi.string(),
        parameters: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              description: Joi.string(),
              in: Joi.string().valid('query', 'path').required(),
              required: Joi.boolean().required(),
              schema: Joi.object({
                type: Joi.string().required(),
                enum: Joi.array(),
              }).required(),
              allowEmptyValue: Joi.boolean(),
              example: Joi.string().allow(null),
            }),
          )
          .min(1)
          .required(),
      }).required(),
    }).required(),
  )
  .default({})

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
    }),
  ),
  openApi: openApiSchema,
}).required()

function assertValidServiceDefinition(service, message = undefined) {
  Joi.assert(service, serviceDefinition, message)
}

const serviceDefinitionExport = Joi.object({
  schemaVersion: Joi.equal('0').required(),
  categories: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
      }),
    )
    .required(),
  services: Joi.array().items(serviceDefinition).required(),
}).required()

function assertValidServiceDefinitionExport(openApiSpec, message = undefined) {
  Joi.assert(openApiSpec, serviceDefinitionExport, message)
}

export {
  assertValidServiceDefinition,
  assertValidServiceDefinitionExport,
  openApiSchema,
}
