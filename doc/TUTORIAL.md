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
  You can as [merged pull-requests][mergedpr].
  Usally they start with "add".
- [implementations and their commits][blame] in the  the [server.js][server] file.


(2) Setup
---------

I suppose you have [git](https://git-scm.com/) installed.
If you do not, install it and learn about the [Github workflow](http://try.github.io/).

1. [Fork][fork] this repository.
2. Clone the fork  
   `git clone git@github.com:YOURGITHUBUSERNAME/shields.git`
3. `cd shields`
4. Install npm  
   `sudo apt-get install npm nodejs-legacy curl`
5. Install all packages  
   `npm install`
6. Setup  
   `make setup`
7. Run the server  
   `node server.js 8080`
8. Visit the website to check the badges get loaded slowly:  
   [http://[::1]:8080/try.html](http://[::1]/try.html)

(3) Open an Issue
-----------------

Before you want to implement you service, you may want to [open an issue][openissue] and describe what you have in mind:
- What is the badge for
- Which API do you want to use

You may additionally process to say what you want to work on.
This infomration allows other humans to help and build on your work.

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

1. This is the route specified as regular expression.
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
   `node server.js 8080`
4. Visit the badge at [http://[::1]:8080/test/asd/fgh.svg](http://[::1]:8080/test/asd/fgh.svg).

### (4.1) Querying an API

Make sure, you can get the data somehow, best as JSON.
There might be an API for your service delivering the data.

The test badge above is quite simple and static.
You can change the behavior by asking your API.
There are various examples on how to answer with a customized badge:

- [docker automated builds](https://github.com/badges/shields/blob/bf373d11cd522835f198b50b4e1719027a0a2184/server.js#L5014)
- [the famous travis badge](https://github.com/badges/shields/blob/bf373d11cd522835f198b50b4e1719027a0a2184/server.js#L431)

### (4.2) Add Badges to Front Page

Once you are done implementing you badge, you can add it to the collection on [shields.io](http://shields.io/).

First, we amke it visible on [http://[::1]:8080/try.html][try].
Edit [try.html][tryhtml] in the right section (Build, Downloads, ...) and add your badge:

```
  <tr><th data-keywords='test badge keyword for google'>Test Badge from the tutorial</th>
    <td><img src='/test/first/second.svg' alt=''/></td>
    <td><code>https://img.shields.io/test/first/second.svg</code></td>
  </tr>
```

Save, restart and you can see it [locally][try].

If this is fine, you can generate the website:

   make website

This changes the index.html file automatically.

## (5) Create a Pull Request

You have implemented changes in `server.js`, `try.html` and `index.html`.
These changes shall go onto shields.io.
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
[try]: http://[::1]:8080/try.html
[server]: ../server.js
[tryhtml]: ../try.html
[edit]: https://github.com/badges/shields/edit/master/doc/TUTORIAL.md
