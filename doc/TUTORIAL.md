Tutorial on how to add a badge for a service
============================================

This tutorial should help you add a service to shields.io in form of a badge.
You will need to learn to use JavaScript, git and Github.
Please [improve the tutorial][edit] while you read it.

(1) Reading
-----------

You should read the following:

- [CONTRIBUTING.md](../CONTRIBUTING.md)

You can read

- previous successful pull-requests to see how other people implemented their badges.
  Usually they start with "[add][add-pr]".
- later [pull-requests tagged with `new-badge`][new-badge].
- [implementations and their commits][blame] in the [server.js][server] file.
- [merged pull-requests][mergedpr].

(2) Setup
---------

I suppose you have [git](https://git-scm.com/) installed.
If you do not, install it and learn about the [Github workflow](http://try.github.io/).

1. [Fork][fork] this repository.
2. Clone the fork
   `git clone git@github.com:YOURGITHUBUSERNAME/shields.git`
3. `cd shields`
4. Install npm and other required packages (Ubuntu 16.10)
   `sudo apt-get install npm nodejs-legacy curl imagemagick`
5. Install all packages
   `npm install`
6. Build the frontend
   `npm run build`
6. Run the server
   `npm start`
7. Visit the website to check the badges get loaded slowly:
   [http://[::1]:8080/](http://[::1]/)

(3) Open an Issue
-----------------

Before you want to implement your service, you may want to [open an issue][openissue] and describe what you have in mind:
- What is the badge for?
- Which API do you want to use?

You may additionally proceed to say what you want to work on.
This information allows other humans to help and build on your work.

(4) Implementing
----------------

If there is already a related badge, you may want to place your code next to it.

Here you can see code for a badge at route for `/test/<first>/<second><ending>`.
Lines with `// (1)` and alike are commented below.

```js
// Test integration.
camp.route(/^\/test\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,  // (1)
cache(function(data, match, sendBadge, request) {
  var first = match[1];                                             // (2)
  var second = match[2];                                            // (2)
  var format = match[3];                                            // (2)
  var badgeData = getBadgeData('X' + first + 'X', data);            // (3)
  badgeData.text[1] = second;                                       // (4)
  badgeData.colorscheme = 'blue';                                   // (4)
  badgeData.colorB = '#008bb8';                                     // (4)
  sendBadge(format, badgeData);                                     // (5)
}));
```

Description of the code:

1. This is the route specified as [regular expression][regex].
2. These lines parse the route given in (1).
3. This requests a default configuration for the badge.
4. These lines customize the design of the badge.
   Possible attributes are [specified][format].
5. This line sends the response back to the browser.

To try out this custom badge do the following:

1. Copy and paste these lines into [server.js][server].
   I did this at about line 5000.
2. Quit the running server with `Control+C`.
3. Start the server again.
   `npm start`
4. Visit the badge at <http://[::]:8080/test/subject/STATUS.svg>.
   It should look like this: ![](https://img.shields.io/badge/subject-STATUS-blue.svg)

### (4.1) Querying an API

Make sure, you can get the data somehow, best as JSON.
There might be an API for your service delivering the data.

The test badge above is quite simple and static.
You can change the behavior by asking your API.
There are various examples on how to answer with a customized badge:

- [Docker Hub automated integration][docker-example]
- [the famous travis badge][travis-example]

This example is the for the Docker Hub automated integration. ([Source][docker-example])

```js
// Docker Hub automated integration.                                             // (1)
camp.route(/^\/docker\/automated\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,    // (2)
cache(function(data, match, sendBadge, request) {                                // (2)
  var user = match[1];  // eg, jrottenberg                                       // (3)
  var repo = match[2];  // eg, ffmpeg                                            // (3)
  var format = match[3];                                                         // (3)
  if (user === '_') {                                                            // (4)
    user = 'library';                                                            // (4)
  }                                                                              // (4)
  var path = user + '/' + repo;                                                  // (4)
  var url = 'https://registry.hub.docker.com/v2/repositories/' + path;           // (4)
  var badgeData = getBadgeData('docker build', data);                            // (5)
  request(url, function(err, res, buffer) {                                      // (6)
    if (checkErrorResponse(badgeData, err, res, 'repo not found')) {             // (7)
      sendBadge(format, badgeData);                                              // (7)
      return;                                                                    // (7)
    }
    try {
      var parsedData = JSON.parse(buffer);                                       // (8)
      var is_automated = parsedData.is_automated;                                // (8)
      if (is_automated) {
        badgeData.text[1] = 'automated';                                         // (9)
        badgeData.colorscheme = 'blue';                                          // (9)
      } else {
        badgeData.text[1] = 'manual';                                            // (9)
        badgeData.colorscheme = 'yellow';                                        // (9)
      }
      badgeData.colorB = data.colorB || '#008bb8';                               // (9)
      sendBadge(format, badgeData);                                              // (9)
    } catch(e) {                                                                 // (10)
      badgeData.text[1] = 'invalid';                                             // (10)
      sendBadge(format, badgeData);                                              // (10)
    }
  });
}));
```

The source code is annotated with `// (1)` and alike on the right side.
The following numbering explains what happens in the corresponding lines.

1. All badges are preceded by a comment.
   This allows other developers to find the badge regardless of implementation.
   Usually, badges with a similar topic have their implementation close to each other's.
2. The [regular expression][regex] matches the path behind the host name in the URL, e.g. `img.shields.io`.
   ```
   /^\/docker\/automated\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/
                                          \.(svg|png|gif|jpg|json)
                                          The supported endings
                                          e.g. ".svg"
                          ([^/]+)\/([^/]+)
                          The name of the repository
                          e.g. "jrottenberg/ffmpeg"
     \/docker\/automated\/
     "/docker/automated/" is the start of the url. "/" must be escaped to "\/".
   ```
   Example: <https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg>
   All parts are enclosed by brackets `()` are passed though to the function as
   the parameter `match`.
3. The parts of the match are named.
4. Based on the input parameters, we construct our query to the API.
   Here, `"_"` is a special case.
   The `url` is created to query the API.
5. Create the basic badge to use.
   You can read about the [different formats available][format].
   It contains the format for all responses, regardless of the API's response.
6. We request the `url` and pass a call back function to the request.
   The function is called once the data is retrieved from the API.
7. We want to always see a badge regardless the input.
   In some cases the API may return an error or a HTTP status code indicating
   a client error or a server error e.g. if the query was invalid. The error response
   is handled by the [checkErrorResponse](https://github.com/badges/shields/blob/8fcc13d5bced23f53c9f075e51b419060f6cc124/lib/error-helper.js#L8)
   function and a badge with an appropriate status is returned: "inaccessible"
   ![](https://img.shields.io/badge/docker_build-inaccessible-red.svg), "not found"
   ![](https://img.shields.io/badge/docker_build-not_found-lightgrey.svg)
   or "invalid" ![](https://img.shields.io/badge/docker_build-invalid-lightgrey.svg).
8. The data returned by the API as JSON is parsed.
9. Based on the result, the text and the color of the badge are altered.
   ![](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg)
   ![](https://img.shields.io/docker/automated/codersos/ubuntu-remix.svg)
10. In case of an error, an "invalid" badge is constructed.
    ![](https://img.shields.io/badge/docker_build-invalid-lightgrey.svg)

The pattern described can be found in may other badges.
When you look at the [server.js][server], you find many other badges.
Some of them may query the same API.
Those can be of additional help when implementing your badge.

### (4.2) Querying an API with Authentication

TODO
This has something to do with [private/secret.json](https://github.com/badges/shields/search?utf8=%E2%9C%93&q=private%2Fsecret.json&type=).
- Credentials should be stored there.
- You do not need to create this file, the server works without.
- Somewhere the format (JSON? Keys?) should be documented.
  - How to get the keys?

### (4.3) Add Badges to Front Page

Once you are done implementing your badge, you can add it to the collection on [shields.io](http://shields.io/).

First, we make it visible locally at [http://[::1]:8080/][home]. Edit
[lib/all-badge-examples.js][allbadges] in the right category (Build,
Downloads, ...) and add your badge:

```js
{
  title: 'Test Badge from the tutorial',
  keywords: [
    'some-search-keyword'
  ],
  previewUri: '/test/subject/STATUS.svg',
},
```

Save, run `npm run build`, and you can see it [locally][home].

### (4.4) Write Tests

When creating a badge for a new service or changing a badge's behavior, tests
should be included. They serve several purposes:

1. They speed up future contributors when they are debugging or improving a
   badge.
2. If a contributors like to change your badge, chances are, they forget
   edge cases and break your code.
   Tests may give hints in such cases.
3. The contributor and reviewer can easily verify the code works as
   intended.
4. When a badge stops working on the live server, maintainers can find out
   right away.

There is a dedicated [tutorial for tests in the service-tests folder][tests-tutorial].
Please follow it to include tests on your pull-request.

## (5) Create a Pull Request

You have implemented changes in `server.js` and `lib/all-badge-examples.js`.
These changes shall go live on shields.io.
To do that, [create a pull-request](https://help.github.com/articles/creating-a-pull-request/).
By doing this, your changes are made public to the shields team.
You can respond to their questions and the badge may soon be merged.

Further Reading
---------------

These files can also be of help for creating your own badge.

- [INSTALL.md](../INSTALL.md)
- [a list of pull-requests with new badges](https://github.com/badges/shields/pulls?utf8=%E2%9C%93&q=is%3Apr%20label%3Anew-badge%20)


[mergedpr]: https://github.com/badges/shields/pulls?utf8=%E2%9C%93&q=is%3Apr%20is%3Amerged
[blame]: https://github.com/badges/shields/blame/master/server.js
[openissue]: https://github.com/badges/shields/issues/new
[example-api]: https://hub.docker.com/v2/repositories/mariobehling/loklak/buildhistory/?page_size=100
[example-issue]: https://github.com/badges/shields/issues/886
[fork]: https://github.com/badges/shields/fork
[format]: INSTALL.md#format
[home]: http://[::1]:8080/
[server]: ../server.js
[allbadges]: ../lib/all-badge-examples.js
[edit]: https://github.com/badges/shields/edit/master/doc/TUTORIAL.md
[add-pr]: https://github.com/badges/shields/issues?utf8=%E2%9C%93&q=is%3Aissue%20in%3Atitle%20add%20
[new-badge]: https://github.com/badges/shields/pulls?q=is%3Apr+label%3Anew-badge
[docker-example]: https://github.com/badges/shields/blob/b126b4ebdc64015a3d6e845d9c051f69ad81c4ea/server.js#L6275
[travis-example]: https://github.com/badges/shields/blob/b126b4ebdc64015a3d6e845d9c051f69ad81c4ea/server.js#L403
[regex]: https://www.w3schools.com/jsref/jsref_obj_regexp.asp
[tests-tutorial]: service-tests.md#readme
