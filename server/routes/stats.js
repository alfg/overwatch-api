const express = require('express');
const router = express.Router();

import { getStats } from '../../api/src';
import cache from '../cache';
import utils from '../utils';
import config from '../config';

/**
 * @api {get} /stats/:platform/:region/:tag Get profile of player.
 * @apiName GetStats
 * @apiGroup Stats
 *
 * @apiParam {String} platform Platform of user. pc/xbl/psn/nintendo-switch
 * @apiParam {String} region Region of player. us/eu/kr/cn/global
 * @apiParam {String} tag BattleTag of user. Replace # with -.
 * @apiParam (Query String Params) {String} include Query String parameter to specifiy include filters. Comma deliminated. 
 * @apiSuccess {Object} data Profile data.
 *
 * @apiExample {curl} Example usage:
 *  curl -i https://owapi.io/stats/pc/us/user-12345
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
  const include = req.query.include && req.query.include.split(',') || null;

  const cacheKey = `stats_${platform}_${region}_${tag}`;

  cache.getOrSet(cacheKey, config.CACHE_TTL, fnStats, function(err, data) {
    if (err) return res.json({ message: err.toString() });

    if (data.statusCode) {
      res.status(data.response.statusCode).send(data.response.statusMessage);
    } else {
      const filtered = utils.filterIncludes(include, data);
      res.json(filtered);
    }
  });

  function fnStats(callback) {
    getStats(platform, region, tag, (err, data) => {
      if (err) return callback({ message: err.toString()});
      callback(data);
    });
  }
});

export default router;
