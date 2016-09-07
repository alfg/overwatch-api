const express = require('express');
const router = express.Router();
import { name, description, version, bugs, homepage } from '../../package.json';


/**
 * @api {get} / Get API status.
 * @apiName GetAPI
 * @apiGroup API
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://ow-api.herokuapp.com/
 *
 * @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
      name: "overwatch-api",
      description: "Overwatch API",
      version: "0.0.1",
      homepage: "https://github.com/alfg/overwatch-api",
      bugs: "https://github.com/alfg/overwatch-api/issues",
      docs: "http://ow-api.herokuapp.com/docs"
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
