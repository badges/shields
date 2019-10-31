# Tutorial on how to add a badge for a service

This tutorial should help you add a service to shields.io in form of a badge.
You will need to learn to use JavaScript, Git and GitHub, however, this document
will guide you through that journey if you are a beginner.
Please [improve the tutorial](https://github.com/badges/shields/edit/master/doc/TUTORIAL.md) while you read it.

## (1) Reading

- [Contributing Guidance](../CONTRIBUTING.md)
- [Documentation](https://contributing.shields.io/index.html) for the Shields Core API
- You can also read previous
  [merged pull-requests with the 'service-badge' label](https://github.com/badges/shields/pulls?utf8=%E2%9C%93&q=is%3Apr+label%3Aservice-badge+is%3Amerged)
  to see how other people implemented their badges.

## (2) Setup

### Pre-requisites

#### Git

You should have [git](https://git-scm.com/) installed.
If you do not, [install git](https://www.linode.com/docs/development/version-control/how-to-install-git-on-linux-mac-and-windows/)
and learn about the [Github workflow](http://try.github.io/).

#### Node, NPM

Node 8 or later is required. If you don't already have them,
install node and npm: https://nodejs.org/en/download/

### Setup a dev install

1. [Fork](https://github.com/badges/shields/fork) this repository.
2. Clone the fork
   `git clone git@github.com:YOURGITHUBUSERNAME/shields.git`
3. `cd shields`
4. Install project dependencies
   `npm ci`
5. Run the badge server and the frontend dev server
   `npm start`
6. Visit the website to check the front-end is loaded: [http://localhost:3000/](http://localhost:3000/).

In case you get the _"getaddrinfo ENOTFOUND localhost"_ error, visit [http://127.0.0.1:3000/](http://127.0.0.1:3000) instead or take a look at [this issue](https://github.com/angular/angular-cli/issues/2227#issuecomment-358036526).

## (3) Open an Issue

Before you want to implement your service, you may want to [open an issue](https://github.com/badges/shields/issues/new?template=3_Badge_request.md) and describe what you have in mind:

- What is the badge for?
- Which API do you want to use?

You may additionally proceed to say what you want to work on.
This information allows other humans to help and build on your work.

## (4) Implementing

### (4.1) Structure and Layout

Service badge code is stored in the [/services](https://github.com/badges/shields/tree/master/services/) directory.
Each service has a directory for its files:

- In files ending with `.service.js`, you can find the code which handles
  incoming requests and generates the badges.
  Sometimes, code for a service can be re-used.
  This might be the case when you add a badge for an API which is already used
  by other badges.

  Imagine a service that lives at https://img.shields.io/example/some-param-here.

  - For services with a single badge, the badge code will generally be stored in
    `/services/example/example.service.js`.
    If you add a badge for a new API, create a new directory.

    Example: [wercker](https://github.com/badges/shields/tree/master/services/wercker)

  - For service families with multiple badges we usually store the code for each
    badge in its own file like this:

    - `/services/example/example-downloads.service.js`
    - `/services/example/example-version.service.js` etc.

    Example: [ruby gems](https://github.com/badges/shields/tree/master/services/gem)

- In files ending with `.tester.js`, you can find the code which uses
  the shields server to test if the badges are generated correctly.
  There is a [chapter on Tests][write tests].

### (4.2) Our First Badge

All service badge classes inherit from [BaseService] or another class which extends it.
Other classes implement useful behavior on top of [BaseService].

- [BaseJsonService](https://contributing.shields.io/module-core_base-service_base-json-basejsonservice)
  implements methods for performing requests to a JSON API and schema validation.
- [BaseXmlService](https://contributing.shields.io/module-core_base-service_base-xml-basexmlservice)
  implements methods for performing requests to an XML API and schema validation.
- [BaseYamlService](https://contributing.shields.io/module-core_base-service_base-yaml-baseyamlservice)
  implements methods for performing requests to a YAML API and schema validation.
- [BaseSvgScrapingService](https://contributing.shields.io/module-core_base-service_base-svg-scraping-basesvgscrapingservice)
  implements methods for retrieving information from existing third-party badges.
- [BaseGraphqlService](https://contributing.shields.io/module-core_base-service_base-graphql-basegraphqlservice)
  implements methods for performing requests to a GraphQL API and schema validation.
- If you are contributing to a _service family_, you may define a common super
  class for the badges or one may already exist.

[baseservice]: https://contributing.shields.io/module-core_base-service_base-baseservice

As a first step we will look at the code for an example which generates a badge without contacting an API.

```js
// (1)
'use strict'
// (2)
const { BaseService } = require('..')

// (3)
module.exports = class Example extends BaseService {
  // (4)
  static get category() {
    return 'build'
  }

  // (5)
  static get route() {
    return {
      base: 'example',
      pattern: ':text',
    }
  }

  // (6)
  async handle({ text }) {
    return {
      label: 'example',
      message: text,
      color: 'blue',
    }
  }
}
```

Description of the code:

1. We declare strict mode at the start of each file. This prevents certain classes of error such as undeclared variables.
2. Our service badge class will extend `BaseService` so we need to require it. Variables are declared with `const` and `let` in preference to `var`.
3. Our module must export a class which extends `BaseService`.
4. Returns the name of the category to sort this badge into (eg. "build"). Used to sort the examples on the main [shields.io](https://shields.io) website. [Here](https://github.com/badges/shields/blob/master/services/categories.js) is the list of the valid categories. See [section 4.4](#44-adding-an-example-to-the-front-page) for more details on examples.
5. `route()` declares the URL path at which the service operates. It also maps components of the URL path to handler parameters.
   - `base` defines the first part of the URL that doesn't change, e.g. `/example/`.
   - `pattern` defines the variable part of the route, everything that comes after `/example/`. It can include any
     number of named parameters. These are converted into
     regular expressions by [`path-to-regexp`][path-to-regexp].
     Because a service instance won't be created until it's time to handle a request, the route and other metadata must be obtained by examining the classes themselves. [That's why they're marked `static`.][static]
6. All badges must implement the `async handle()` function that receives parameters to render the badge. Parameters of `handle()` will match the name defined in `route()` Because we're capturing a single variable called `text` our function signature is `async handle({ text })`. `async` is needed to let JavaScript do other things while we are waiting for result from external API. Although in this simple case, we don't make any external calls. Our `handle()` function should return an object with 3 properties:
   - `label`: the text on the left side of the badge
   - `message`: the text on the right side of the badge - here we are passing through the parameter we captured in the route regex
   - `color`: the background color of the right side of the badge

The process of turning this object into an image is handled automatically by the `BaseService` class.

To try out this example badge:

1. Copy and paste this code into a new file in `/services/example/example.service.js`
2. The server should restart on its own. (If it doesn't for some reason, quit
   the running server with `Control+C`, then start it again with `npm start`.)
3. Visit the badge at <http://localhost:8080/example/foo>.
   It should look like this: ![](https://img.shields.io/badge/example-foo-blue)

[path-to-regexp]: https://github.com/pillarjs/path-to-regexp#parameters
[static]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static

### (4.3) Querying an API

The example above was completely static. In order to make a useful service badge we will need to get some data from somewhere. The most common case is that we will query an API which serves up some JSON data, but other formats (e.g: XML) may be used.

This example is based on the [Ruby Gems version](https://github.com/badges/shields/blob/master/services/gem/gem-version.service.js) badge:

```js
// (1)
'use strict'

// (2)
const { renderVersionBadge } = require('..//version')
// (3)
const { BaseJsonService } = require('..')

// (4)
const Joi = require('@hapi/joi')
const schema = Joi.object({
  version: Joi.string().required(),
}).required()

// (5)
module.exports = class GemVersion extends BaseJsonService {
  // (6)
  static get category() {
    return 'version'
  }

  // (7)
  static get route() {
    return {
      base: 'gem/v',
      pattern: ':gem',
    }
  }

  // (8)
  static get defaultBadgeData() {
    return { label: 'gem' }
  }

  // (11)
  static render({ version }) {
    return renderVersionBadge({ version })
  }

  // (10)
  async fetch({ gem }) {
    return this._requestJson({
      schema,
      url: `https://rubygems.org/api/v1/gems/${gem}.json`,
    })
  }

  // (9)
  async handle({ gem }) {
    const { version } = await this.fetch({ gem })
    return this.constructor.render({ version })
  }
}
```

Description of the code:

1. As with the first example, we declare strict mode at the start of each file.
2. In this case we are making a version badge, which is a common pattern. Instead of directly returning an object in this badge we will use a helper function to format our data consistently. There are a variety of helper functions to help with common tasks in `/services`. Some useful generic helpers can be found in:
   - [build-status.js](https://github.com/badges/shields/blob/master/services/build-status.js)
   - [color-formatters.js](https://github.com/badges/shields/blob/master/services/color-formatters.js)
   - [licenses.js](https://github.com/badges/shields/blob/master/services/licenses.js)
   - [text-formatters.js](https://github.com/badges/shields/blob/master/services/text-formatters.js)
   - [version.js](https://github.com/badges/shields/blob/master/services/version.js)
3. Our badge will query a JSON API so we will extend `BaseJsonService` instead of `BaseService`. This contains some helpers to reduce the need for boilerplate when calling a JSON API.
4. We perform input validation by defining a schema which we expect the JSON we receive to conform to. This is done using [Joi](https://github.com/hapijs/joi). Defining a schema means we can ensure the JSON we receive meets our expectations and throw an error if we receive unexpected input without having to explicitly code validation checks. The schema also acts as a filter on the JSON object. Any properties we're going to reference need to be validated, otherwise they will be filtered out. In this case our schema declares that we expect to receive an object which must have a property called 'version', which is a string.
5. Our module exports a class which extends `BaseJsonService`
6. Returns the name of the category to sort this badge into (eg. "build"). Used to sort the examples on the main [shields.io](https://shields.io) website. [Here](https://github.com/badges/shields/blob/master/services/categories.js) is the list of the valid categories. See [section 4.4](#44-adding-an-example-to-the-front-page) for more details on examples.
7. As with our previous badge, we need to declare a route. This time we will capture a variable called `gem`.
8. We can use `defaultBadgeData()` to set a default `color`, `logo` and/or `label`. If `handle()` doesn't return any of these keys, we'll use the default. Instead of explicitly setting the label text when we return a badge object, we'll use `defaultBadgeData()` here to define it declaratively.
9. We now jump to the bottom of the example code to the function all badges must implement: `async handle()`. This is the function the server will invoke to handle an incoming request. Because our URL pattern captures a variable called `gem`, our function signature is `async handle({ gem })`. We usually separate the process of generating a badge into 2 stages or concerns: fetch and render. The `fetch()` function is responsible for calling an API endpoint to get data. The `render()` function formats the data for display. In a case where there is a lot of calculation or intermediate steps, this pattern may be thought of as fetch, transform, render and it might be necessary to define some helper functions to assist with the 'transform' step.
10. Working our way upward, the `async fetch()` method is responsible for calling an API endpoint to get data. Extending `BaseJsonService` gives us the helper function `_requestJson()`. Note here that we pass the schema we defined in step 4 as an argument. `_requestJson()` will deal with validating the response against the schema and throwing an error if necessary.

    - `_requestJson()` automatically adds an Accept header, checks the status code, parses the response as JSON, and returns the parsed response.
    - `_requestJson()` uses [request](https://github.com/request/request) to perform the HTTP request. Options can be passed to request, including method, query string, and headers. If headers are provided they will override the ones automatically set by `_requestJson()`. There is no need to specify json, as the JSON parsing is handled by `_requestJson()`. See the `request` docs for [supported options](https://github.com/request/request#requestoptions-callback).
    - Error messages corresponding to each status code can be returned by passing a dictionary of status codes -> messages in `errorMessages`.
    - A more complex call to `_requestJson()` might look like this:
      ```js
      return this._requestJson({
        schema: mySchema,
        url,
        options: { qs: { branch: 'master' } },
        errorMessages: {
          401: 'private application not supported',
          404: 'application not found',
        },
      })
      ```

11. Upward still, the `static render()` method is responsible for formatting the data for display. `render()` is a pure function so we can make it a `static` method. By convention we declare functions which don't reference `this` as `static`. We could explicitly return an object here, as we did in the previous example. In this case, we will hand the version string off to `renderVersionBadge()` which will format it consistently and set an appropriate color. Because `renderVersionBadge()` doesn't return a `label` key, the default label we defined in `defaultBadgeData()` will be used when we generate the badge.

This code allows us to call this URL <https://img.shields.io/gem/v/formatador> to generate this badge: ![](https://img.shields.io/gem/v/formatador)

It is also worth considering the code we _haven't_ written here. Note that our example doesn't contain any explicit error handling code, but our badge handles errors gracefully. For example, if we call https://img.shields.io/gem/v/does-not-exist we render a 'not found' badge ![](https://img.shields.io/gem/v/does-not-exist) because https://rubygems.org/api/v1/gems/this-package-does-not-exist.json returns a `404 Not Found` status code. When dealing with well-behaved APIs, some of our error handling will be handled implicitly in `BaseJsonService`.

Specifically `BaseJsonService` will handle the following errors for us:

- API does not respond
- API responds with a non-`200 OK` status code
- API returns a response which can't be parsed as JSON
- API returns a response which doesn't validate against our schema

Sometimes it may be necessary to manually throw an exception to deal with a
non-standard error condition. If so, there are several standard exceptions that can be used. The errors are documented at
[errors](https://contributing.shields.io/module-core_base-service_errors.html)
and can be imported via the import shortcut and then thrown:

```js
const { NotFound } = require('..')

throw new NotFound({ prettyMessage: 'package not found' })
```

### (4.4) Adding an Example to the Front Page

Once we have implemented our badge, we can add it to the index so that users can discover it. We will do this by adding an additional method `examples()` to our class.

```js
module.exports = class GemVersion extends BaseJsonService {
  // ...

  static get category() {
    // (1)
    return 'version'
  }

  static get examples() {
    // (2)
    return [
      {
        // (3)
        title: 'Gem',
        namedParams: { gem: 'formatador' },
        staticPreview: this.render({ version: '2.1.0' }),
        keywords: ['ruby'],
      },
    ]
  }
}
```

1. We defined category earlier in the tutorial. The `category()` property defines which heading in the index our example will appear under.
2. The examples property defines an array of examples. In this case the array will contain a single object, but in some cases it is helpful to provide multiple usage examples.
3. Our example object should contain the following properties:
   - `title`: Descriptive text that will be shown next to the badge
   - `namedParams`: Provide a valid example of params we can substitute into
     the pattern. In this case we need a valid ruby gem, so we've picked [formatador](https://rubygems.org/gems/formatador).
   - `staticPreview`: On the index page we want to show an example badge, but for performance reasons we want that example to be generated without making an API call. `staticPreview` should be populated by calling our `render()` method with some valid data.
   - `keywords`: If we want to provide additional keywords other than the title and the category, we can add them here. This helps users to search for relevant badges.

Save, run `npm start`, and you can see it [locally](http://127.0.0.1:3000/).

If you update `examples`, you don't have to restart the server. Run `npm run defs` in another terminal window and the frontend will update.

### (4.5) Write Tests <!-- Change the link below when you change the heading -->

[write tests]: #45-write-tests

When creating a badge for a new service or changing a badge's behavior, tests
should be included. They serve several purposes:

1. They speed up future contributors when they are debugging or improving a
   badge.
2. If the contributors would like to change your badge, chances are, they forget
   edge cases and break your code.
   Tests may give hints in such cases.
3. The contributor and reviewer can easily verify the code works as
   intended.
4. When a badge stops working on the live server, maintainers can find out
   right away.

There is a dedicated [tutorial for tests in the service-tests folder](service-tests.md).
Please follow it to include tests on your pull-request.

### (4.6) Update the Docs

If your submission requires an API token or authentication credentials, please
update [server-secrets.md](./server-secrets.md). You should explain what the
token or credentials are for and how to obtain them.

## (5) Create a Pull Request

Once you have implemented a new badge:

- Before submitting your changes, please review the [coding guidelines](https://github.com/badges/shields/blob/master/CONTRIBUTING.md#coding-guidelines).
- [Create a pull-request](https://help.github.com/articles/creating-a-pull-request/) to propose your changes.
- CI will check the tests pass and that your code conforms to our coding standards.
- We also use [Danger](https://danger.systems/) to check for some common problems. The first comment on your pull request will be posted by a bot. If there are any errors or warnings raised, please review them.
- One of the
  [maintainers](https://github.com/badges/shields/blob/master/README.md#project-leaders)
  will review your contribution.
- We'll work with you to progress your contribution suggesting improvements if necessary. Although there are some occasions where a contribution is not appropriate, if your contribution conforms to our [guidelines](https://github.com/badges/shields/blob/master/CONTRIBUTING.md#badge-guidelines) we'll aim to work towards merging it. The majority of pull requests adding a service badge are merged.
- If your contribution is merged, the final comment on the pull request will be an automated post which you can monitor to tell when your contribution has been deployed to production.
