const nock = require('nock');

// Concise support for mock requests in IcedFrisby.
//
// Example:
//
// const frisby = require('icedfrisby-nock')(require('icedfrisby'));
//
// frisby.create(...)
//   .get(...)
//   .intercept(nock => nock('http://example.com')
//     .get('/foobar')
//     .reply(200))
//   .enableNetConnect()
//   .expectJSON(...)
//
function IcedFrisbyNock (superClassIsh) {
  let superClass, statics;
  if ((typeof superClassIsh) !== 'function') {
    // Handle IcedFrisby which does not expose its constructor.
    statics = superClassIsh;
    superClass = superClassIsh.create().constructor;
  } else {
    statics = superClass = superClassIsh;
  }

  function IcedFrisbyNock () {
    superClass.apply(this, arguments);
  }

  // Transfer all statics from super, then override some.
  Object.assign(IcedFrisbyNock, statics);
  IcedFrisbyNock.prototype = Object.create(superClass.prototype);
  delete IcedFrisbyNock.version;
  IcedFrisbyNock.create = function (msg) {
    return new IcedFrisbyNock(msg);
  };

  // Set up intercepts. Pass in a setup function which takes one argument,
  // `nock`, and returns an interceptor. The function is invoked before the
  // test, and the returned interceptor is cleaned up afterward.
  //
  // By default, disables remote network connections (other than localhost).
  // To override this, chain on a call to `.enableNetConnect()`.
  //
  // You can only call this once per test.
  //
  // @param setup The setup function, receives `nock` and returns a nock object
  IcedFrisbyNock.prototype.intercept = function (setup) {
    let interceptor;

    // Work around a limitation in IcedFrisby that prevents reliably
    // clean up in `after` callbacks.
    this.before(function () {
      nock.cleanAll();
    });

    // This is a bad idea right now, since there isn't a way to clean it up.
    // this.before(function () {
    //   nock.disableNetConnect();
    //   nock.enableNetConnect(/(localhost|127\.0\.0\.1)/);
    // });

    this.before(function () {
      interceptor = setup(nock);
    });

    // Due to a limitation in IcedFrisby, this isn't called reliably.
    // https://github.com/MarkHerhold/IcedFrisby/issues/27#issuecomment-292600587
    this.after(function () {
      if (interceptor) {
        nock.removeInterceptor(interceptor);
      }
    });

    return this;
  };

  // Enable remote network connections.
  IcedFrisbyNock.prototype.enableNetConnect = function (matcher) {
    nock.enableNetConnect(matcher);
  };

  return IcedFrisbyNock;
}
module.exports = IcedFrisbyNock;
