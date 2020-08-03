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
 *  curl -i https://owapi.io/profile/pc/us/user-12345
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
  {
    "username": "Jay3",
    "level": 2989,
    "portrait": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/190aa6150e33690e39a9c91308d5da9b2e262262657af26579b95e939c44d5ad.png",
    "endorsement": {
      "sportsmanship": {
        "value": 0.18,
        "rate": 18
      },
      "shotcaller": {
        "value": 0.44,
        "rate": 44
      },
      "teammate": {
        "value": 0.38,
        "rate": 38
      },
      "level": null,
      "frame": "https://static.playoverwatch.com/svg/icons/endorsement-frames-3c9292c49d.svg#_2",
      "icon": "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjQwIiB3aWR0aD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxjaXJjbGUgcj0iMTUuOTE1NDk0MzA5MTg5NTQiIGZpbGw9IiMyYTJiMmUiIHN0cm9rZS1kYXNoYXJyYXk9IjQ0IDU2IiBzdHJva2UtZGFzaG9mZnNldD0iMjUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlPSIjZjE5NTEyIiBjeD0iNTAlIiBjeT0iNTAlIj48L2NpcmNsZT48Y2lyY2xlIHI9IjE1LjkxNTQ5NDMwOTE4OTU0IiBmaWxsPSJ0cmFuc3BhcmVudCIgc3Ryb2tlLWRhc2hhcnJheT0iMzggNjIiIHN0cm9rZS1kYXNob2Zmc2V0PSI4MSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2U9IiNjODFhZjUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxjaXJjbGUgcj0iMTUuOTE1NDk0MzA5MTg5NTQiIGZpbGw9InRyYW5zcGFyZW50IiBzdHJva2UtZGFzaGFycmF5PSIxOCA4MiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjQzIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZT0iIzQwY2U0NCIgY3g9IjUwJSIgY3k9IjUwJSI+PC9jaXJjbGU+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iY2VudHVyeSBnb3RoaWMsYXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjMwMCIgZm9udC1zaXplPSIxNiIgc3Ryb2tlPSIjZjZmNmY2IiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9IiNmNmY2ZjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5hTjwvdGV4dD48L3N2Zz4="
    },
    "private": false,
    "games": {
      "quickplay": {
        "won": 925,
        "played": 1671
      },
      "competitive": {
        "won": 191,
        "lost": 167,
        "draw": 8,
        "played": 366,
        "win_rate": 53.35
      }
    },
    "playtime": {
      "quickplay": "201:16:17",
      "competitive": "74:45:45"
    },
    "competitive": {
      "tank": {
        "rank": null,
        "rank_img": null
      },
      "damage": {
        "rank": 4429,
        "rank_img": "https://d1u1mce87gyfbn.cloudfront.net/game/rank-icons/rank-GrandmasterTier.png"
      },
      "support": {
        "rank": 3885,
        "rank_img": "https://d1u1mce87gyfbn.cloudfront.net/game/rank-icons/rank-MasterTier.png"
      }
    },
    "levelFrame": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9e8600f97ea4a84d822d8b336f2b1dbfe7372fb9f2b6bf1d0336193567f6f943.png",
    "star": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cd877430ccc400c10e24507dba972e24a4543edc05628045300f1349cf003f3a.png"
  }
 */
router.get('/:platform/:region/:tag', (req, res) => {

  const platform = req.params.platform;
  const region = req.params.region;
  const tag = req.params.tag;
  const include = req.query.include && req.query.include.split(',') || null;

  const cacheKey = `profile_${platform}_${region}_${tag}`;

  cache.getOrSet(cacheKey, config.CACHE_TTL, fnProfile, function(err, data) {
    if (err) return res.json({ message: err.message });

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
      return callback(err, data);
    });
  }
});

export default router;
