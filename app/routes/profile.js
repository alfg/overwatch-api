const express = require('express');
const router = express.Router();

import parse from '../parser/profile';

/**
 * @api {get} /profile/:platform/:region/:tag Get profile of player.
 * @apiName GetProfile
 * @apiGroup Profile
 *
 * @apiParam {String} platform Name of user. pc/xbl/psn
 * @apiParam {String} region Region of player. us/eu/kr/cn/global
 * @apiParam {String} tag BattleTag of user. Replace # with -.
 * @apiSuccess {Object} data Profile data.
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://localhost:3000/profile/pc/us/user-12345
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

	parse(platform, region, tag, (data) => {
		res.json(data);
	});
});

export default router;
