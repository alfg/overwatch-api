const express = require('express');
const router = express.Router();

import { getStandings } from '../../../api/src/owl';
import cache from '../../cache';


/**
 * @api {get} /owl/standings Get standings.
 * @apiName GetStandings
 * @apiGroup OWL
 *
 * @apiSuccess {Object} data OWL standings data.
 *
 * @apiExample {curl} Example usage:
 *  curl -i https://owapi.io/owl/standings
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
      data: {}
    }
 */
router.get('/', (req, res) => {
  const cacheKey = `owl_standings_`;
  const timeout = 30; // 30 seconds.

  cache.getOrSet(cacheKey, timeout, fnStandings, function(data) {
    if (data.statusCode) {
      res.status(data.response.statusCode).send(data.response.statusMessage);
    } else {
      res.json(data);
    }
  });

  function fnStandings(callback) {
    getStandings((err, data) => {
      if (err) return callback(err);
      callback(data);
    });
  }
});

export default router;