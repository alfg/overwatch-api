const express = require('express');
const router = express.Router();
import { name, description, version, bugs, homepage } from '../../package.json';


/**
 * @api {get} / Get API status.
 * @apiName GetAPI
 * @apiGroup API
 *
 * @apiSuccess {Object} status API Status.
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://ow-api.herokuapp.com/
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
     data: {
      }
    }
 */
router.get('/', (req, res) => {

  const json = {
    name,
    description,
    version,
    homepage,
    bugs: bugs.url,
    docs: `${req.protocol}://${req.get('host')}${req.originalUrl}docs`
  };
  res.json(json);
});

export default router;
