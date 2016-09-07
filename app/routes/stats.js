const express = require('express');
const router = express.Router();

import parse from '../parser/stats';
import cache from '../cache';

/**
 * @api {get} /stats/:platform/:region/:tag Get profile of player.
 * @apiName GetStats
 * @apiGroup Stats
 *
 * @apiParam {String} platform Name of user. pc/xbl/psn
 * @apiParam {String} region Region of player. us/eu/kr/cn/global
 * @apiParam {String} tag BattleTag of user. Replace # with -.
 * @apiSuccess {Object} data Profile data.
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://ow-api.herokuapp.com/stats/pc/us/user-12345
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
      username: "user"
      stats: {
        top_heroes: {...}
        combat: {...}
      }
    }
 */
router.get('/:platform/:region/:tag', (req, res) => {

  const platform = req.params.platform;
  const region = req.params.region;
  const tag = req.params.tag;

  const cacheKey = `stats_${platform}_${region}_${tag}`;
  const timeout = 60 * 5; // 5 minutes.

  cache.getOrSet(cacheKey, timeout, getStats, function(data) {
  	res.json(data);
  });

  function getStats(callback) {
  	parse(platform, region, tag, (data) => {
      callback(data);
  	});
  }
});

export default router;
