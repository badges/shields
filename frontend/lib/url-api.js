if (typeof window === 'undefined') {
  module.exports = require('url');
} else {
  module.exports = {
    URL: window.URL,
    URLSearchParams: window.URLSearchParams,
  };
}
