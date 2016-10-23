var NodeCache = require('node-cache');
var myCache = new NodeCache();

var cache = {
  /** Gets key from cache if exists, else sets the cache and returns data.
  * @param {string} cacheKey - Key to get or set.
  * @param {integer} timeout - Timeout (in seconds) for cache to release.
  * @param {Function} fn - Function to get data if key does not exist.
  * @param {Function} callback - Callback function to send back data or value.
  */
  getOrSet: function(cacheKey, timeout, fn, callback) {
    myCache.get(cacheKey, function(err, value) {
      if (!err) {
        if (value == undefined) {
          fn(function(data) {
            if (!(data.statusCode))
              myCache.set(cacheKey, data, timeout);
            callback(data);
          });
        } else {
          callback(value);
        }
      }
    });
  },

  get: function(cacheKey, callback) {
    myCache.get(cacheKey, function(err, value) {
      if (!err) {
        if (value == undefined) {
          callback(value);
        } else {
          callback(value);
        }
      }
    });
  },

  set: function(cacheKey, timeout, fn, callback) {
    fn(function(data) {
      myCache.set(cacheKey, data, timeout, function(err, success) {
        if (!err && success) {
          callback(data);
        }
        callback();
      });
    });
  }
}

module.exports = cache;
