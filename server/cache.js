import redis from 'redis';
import config from './config';

var cache = {
  /** Gets key from cache if exists, else sets the cache and returns data.
  * @param {string} cacheKey - Key to get or set.
  * @param {integer} timeout - Timeout (in seconds) for cache to release.
  * @param {Function} fn - Function to get data if key does not exist.
  * @param {Function} callback - Callback function to send back data or value.
  */
  getOrSet: function(cacheKey, timeout, fn, callback) {
    // Make redis connection.
    const client = redis.createClient({
      url: config.REDIS_URL
    });
    client.on('error', (err) => {
      return callback(err);
    });

    // Get cacheKey. If cacheKey is not present (or expired), then set the key with a timeout.
    client.get(cacheKey, (err, reply) => {
      if (!err) {
        if (!reply) {

          // Run function to get data to cache.
          fn((data) => {
            if (!data.statusCode) {
              client.set(cacheKey, JSON.stringify(data), 'EX', timeout, (err, reply) => {
                if (err) {
                  return callback(err);
                }
              });
            }
            return callback(data);
          });
        } else {
          return callback(JSON.parse(reply));
        }
      }
    });
  }
}

module.exports = cache;
