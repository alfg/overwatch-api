const express = require('express');
const router = express.Router();

import parse from '../parser/stats';

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
 *  curl -i http://localhost:3000/stats/pc/us/user-12345
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

	parse(platform, region, tag, (data) => {
		res.json(data);
	});
});

export default router;
