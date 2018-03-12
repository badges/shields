#!/usr/bin/env fish

mv service-tests/runner lib/service-test-runner
mv service-tests/helpers/response-fixtures.js lib/response-fixtures.js
mv service-tests/helpers/validators.js lib/service-test-validators.js

mv service-tests/README.md doc/service-tests.md

mkdir -p services
mv service-tests/.eslintrc.yml services/

mv services/appveyor.js services/appveyor/appveyor.js

for file in service-tests/*.js
  set service (string match -r "^service-tests/(.*).js\$" $file)[2]
  mkdir services/$service
  mv $file services/$service/$service.tester.js
end

mv service-tests/helpers/nuget-fixtures.js services/nuget/nuget-fixtures.js
