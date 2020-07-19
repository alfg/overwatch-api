const express = require('express');
const router = express.Router();

import { getSchedule } from '../../../api/src/owl';
import cache from '../../cache';


/**
 * @api {get} /owl/schedule Get schedule.
 * @apiName GetSchedule
 * @apiGroup OWL 
 *
 * @apiSuccess {Object} data OWL schedule data.
 *
 * @apiExample {curl} Example usage:
 *  curl -i https://owapi.io/owl/schedule
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
      data: {}
    }
 */
router.get('/', (req, res) => {
  const cacheKey = `owl_schedule_`;
  const timeout = 30; // 30 seconds.

  cache.getOrSet(cacheKey, timeout, fnSchedule, function(err, data) {
    if (err) return res.json({ message: err.toString() });

    if (data.statusCode) {
      res.status(data.response.statusCode).send(data.response.statusMessage);
    } else {
      res.json(data);
    }
  });

  function fnSchedule(callback) {
    getSchedule((err, data) => {
      if (err) return callback(err);
      callback(data);
    });
  }
});

export default router;