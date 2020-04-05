const express = require('express');
const router = express.Router();

import { getProfile } from '../../api/src';
import cache from '../cache';
import utils from '../utils';
import config from '../config';

/**
 * @api {get} /profile/:platform/:region/:tag Get profile of player.
 * @apiName GetProfile
 * @apiGroup Profile
 *
 * @apiParam {String} platform Platform of user. pc/xbl/psn/nintendo-switch
 * @apiParam {String} region Region of player. us/eu/kr/cn/global
 * @apiParam {String} tag BattleTag of user. Replace # with -.
 * @apiParam (Query String Params) {String} include Query String parameter to specifiy include filters. Comma deliminated. 
 * @apiSuccess {Object} data Profile data.
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://ow-api.herokuapp.com/profile/pc/us/user-12345
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
     data: {
        username: "user",
        games: {
          quickplay: {
            wins: "252"
          },
          competitive: {
            wins: "9",
            lost: 18,
            played: "27"
          }
        },
        playtime: {
          quickplay: "63 hours",
          competitive: "5 hours"
        },
        competitive: {
          rank: "2083",
          rank_img: "https://blzgdapipro-a.akamaihd.net/game/rank-icons/rank-10.png"
        },
        levelFrame: "https://blzgdapipro-a.akamaihd.net/game/playerlevelrewards/0x025000000000091F_Border.png",
        star: ""
      }
    }
 */
router.get('/:platform/:region/:tag', (req, res) => {

  const platform = req.params.platform;
  const region = req.params.region;
  const tag = req.params.tag;
  const include = req.query.include && req.query.include.split(',') || null;

  const cacheKey = `profile_${platform}_${region}_${tag}`;

  cache.getOrSet(cacheKey, config.CACHE_TTL, fnProfile, function(data) {
    if (data.statusCode) {
      res.status(data.response.statusCode).send(data.response.statusMessage);
    } else {
      const filtered = utils.filterIncludes(include, data);
      res.json(filtered);
    }
  });

  function fnProfile(callback) {
    getProfile(platform, region, tag, (err, data) => {
      if (err) return callback({ message: err.toString()});
      callback(data);
    });
  }
});

export default router;
