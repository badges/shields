"use strict";

const Joi = require("joi");
const ServiceTester = require("./runner/service-tester");

const t = new ServiceTester({
  id: "dotnetstatus",
  title: "dotnet-status"
});
module.exports = t;

t
  .create("get nuget package status")
  .get("/gh/json-api-dotnet/JsonApiDotNetCore/JsonApiDotNetCore.json")
  .expectJSONTypes(
    Joi.object().keys({
      name: Joi.equal("dependencies"),
      value: Joi.equal(
        "up to date",
        "out of date",
        "processing",
        "project not found"
      )
    })
  );

t
  .create("get nuget package status error")
  .get("/not-a-valid-uri.json")
  .expectJSONTypes(
    Joi.object().keys({
      name: Joi.equal("dependencies"),
      value: Joi.equal("inconclusive")
    })
  );
