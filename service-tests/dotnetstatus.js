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
  .get("/gh/jaredcnance/dotnet-status/API.json")
  .expectJSONTypes(
    Joi.object().keys({
      name: "dependencies",
      value: Joi.equal("up to date", "out of date", "processing")
    })
  );

t
  .create("get nuget package status")
  .get("/gh/jaredcnance/dotnet-status/invalid-project.json")
  .expectJSON({ name: "dependencies", value: "project not found" });

t
  .create("get nuget package status error")
  .get("/not-a-valid-uri.json")
  .expectJSON({ name: "dependencies", value: "inconclusive" });
