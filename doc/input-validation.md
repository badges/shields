# Input Data Validation

When we receive input data from an upstream API, we perform input validation to:

- Ensure we won't throw a runtime error trying to render a badge
- Ensure we won't render badges with spurious or unexpected output e.g: ![](https://img.shields.io/badge/version-null-blue) ![](https://img.shields.io/badge/coverage-NaN%25-red) ![](https://img.shields.io/badge/build-undefined-red) ![](https://img.shields.io/badge/coverage---10%25-critical) etc
- Express and document our understanding of the input data

## Writing schemas and validation

- The default validation mechanism should be to use [Joi](https://github.com/sideway/joi) to define a schema for the input data. Validation against Joi schemas is implemented in the base classes and inherited by every service class that extends them. Sometimes additional manual validation is needed which can't be covered by Joi and plugins in which case we implement it by hand.

- If validation is implemented manually (because we need to enforce a constraint that can't be expressed with Joi), invalid data should throw an [InvalidResponse](https://contributing.shields.io/module-core_base-service_errors-InvalidResponse.html) exception.

- Our definition of "valid" should not be stricter than the upstream API's definition of "valid".

- The schema/validation we choose is informed by the assumptions we're making about the data. e.g:

  - If we're going to use a value, make sure it exists.
  - If we need to multiply it by something, we check it's a number.
  - If we're going to call `.split()` on it, we make sure it's a string.
  - If we're going to address `foo[0]`, `foo` must be an array.
  - If we're going to sort a version on the assumption it is a semver, check it's a semver

- We don't need to validate characteristics we don't rely on. For example, if we're just going to render a version on a badge with the same exact value from the API response and do not need to sort or transform the value, then it doesn't matter what format the version number is in. We can use a very relaxed schema to validate in this case, e.g. `Joi.string().required()`

- If theory (docs) and practice (real-world API responses) conflict, real-world outputs take precedence over documented behaviour. e.g: if the docs say version is a semver but we learn that there are real-world packages where the version number is `0.3b` or `1.2.1.27` then we should accept those values in preference to enforcing the documented API behaviour.

- Shields is descriptive rather than prescriptive. We reflect the established norms of the communities we serve.

- It is fine to define a single schema which is applied to multiple badges. For example, we could define a schema that says:

  ```js
  const schema = Joi.object({
    license: Joi.string().required(),
    version: Joi.string().required(),
  }).required()
  ```

  and have both the license and version badges validate the response against that schema.

- For build status badges there is a shared [isBuildStatus](https://github.com/badges/shields/blob/master/services/build-status.js) validator. In most cases build status badges should use `isBuildStatus` or input validation and `renderBuildStatusBadge` should be used for rendering. Any additional status values can be added to the relevant color arrays.

## Identifying problems

- If we know of a real-world example of a package/repo/etc that causes us to render an invalid value on a badge (e.g: ![](https://img.shields.io/badge/version-null-blue) ![](https://img.shields.io/badge/coverage-NaN%25-red) ![](https://img.shields.io/badge/build-undefined-red) ) our input validation is broken and we should fix it.

- If we know of a real-world example of a package/repo/etc that causes us to throw an unhandled runtime exception, our input validation is broken and we should fix it.

- We should not fail to render a badge because of a validation failure on a field that isn't necessary to render the badge. In the above example of a shared license/version schema: If we become aware of a real-world example of a package/repo/etc that has a `version` key but not a `license` key then we should split the schema (or make `version` optional and handle the error in code).
