const express = require('express');
const router = express.Router();

import { getLiveMatch } from '../../../api/src/owl';
import cache from '../../cache';


/**
 * @api {get} /owl/live Get live match stats.
 * @apiName GetLive
 * @apiGroup OWL 
 *
 * @apiSuccess {Object} data Live Match data.
 *
 * @apiExample {curl} Example usage:
 *  curl -i https://owapi.io/owl/live
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
      data: {}
    }
 */
router.get('/', (req, res) => {
  const cacheKey = `owl_live_`;
  const timeout = 30; // 30 seconds.

  cache.getOrSet(cacheKey, timeout, fnLive, function(err, data) {
    if (err) return res.json({ message: err.toString() });

    if (data.statusCode) {
      res.status(data.response.statusCode).send(data.response.statusMessage);
    } else {
      res.json(data);
    }
  });

  function fnLive(callback) {
    getLiveMatch((err, data) => {
      if (err) return callback(err);
      callback(data);
    });
  }
});

export default router;