# Overwatch API
An unofficial [Overwatch](https://playoverwatch.com) and [Overwatch League](https://overwatchleague.com) HTTP API and NodeJS module.

<p align=center><img src="overwatch.jpg"></img></p>

[![npm](https://img.shields.io/npm/v/overwatch-api.svg)](https://www.npmjs.com/package/overwatch-api)
[![Build Status](https://travis-ci.org/alfg/overwatch-api.svg?branch=master)](https://travis-ci.org/alfg/overwatch-api)

## Features
* Profile Data*
* Career Stats*
* Overwatch League Data
  * Live Match
  * Standings
  * Schedule

**Please note, as of the JUNE 26, 2018 patch, Career Profiles will no longer be public by default (now defaults to Friends Only). An option to make Career Profiles visible has been added under Options > Social > Profile Visibility. 

Your profile *MUST* be public to view most profile and career stats with this API.

Source: https://playoverwatch.com/en-us/news/patch-notes/pc#patch-47946

## API Docs
See: https://owapi.io/docs/

## NPM Module
If you wish to use the Javascript API in your own project, see [api/README.md](api/README.md).

## Demo

```
curl http://owapi.io/profile/pc/us/Calvin-1337
```
```json
{
   "username":"Calvin",
   "level":813,
   "portrait":"https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000EF7.png",
   "games":{
      "quickplay":{
         "won":647
      },
      "competitive":{
         "won":59,
         "lost":48,
         "draw":1,
         "played":108
      }
   },
   "playtime":{
      "quickplay":"129 hours",
      "competitive":"23 hours"
   },
   "competitive":{
      "tank": {
         "rank":4115,
         "rank_img":"https://d1u1mce87gyfbn.cloudfront.net/game/rank-icons/season-2/rank-7.png"
      },
      "damage": {
         "rank":4257,
         "rank_img":"https://d1u1mce87gyfbn.cloudfront.net/game/rank-icons/season-2/rank-7.png"
      },
      "support": {
         "rank":4475,
         "rank_img":"https://d1u1mce87gyfbn.cloudfront.net/game/rank-icons/season-2/rank-7.png"
      }
      
   },
   "levelFrame":"https://d1u1mce87gyfbn.cloudfront.net/game/playerlevelrewards/0x025000000000096F_Border.png",
   "star":"https://d1u1mce87gyfbn.cloudfront.net/game/playerlevelrewards/0x025000000000096F_Rank.png"
}
```

## Install

#### Requirements
* Node v8.0+

```bash
git clone https://github.com/alfg/overwatch-api.git
cd overwatch-api
npm install
npm start
```

Or deploy your own Heroku instance!

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/alfg/overwatch-api)

#### Development
This project is built using [srv](https://github.com/alfg/srv), a microservices stack based on [express](https://expressjs.com/). After installation, run the project using the following:

```bash
node node_modules/srv-cli/build/srv app/index.js
```

[nodemon](https://github.com/remy/nodemon) is recommended for auto-reloading during development:
```bash
nodemon node_modules/srv-cli/build/srv app/index.js
```

Generate docs with the `--docs app/routes` flag.

See [srv](https://github.com/alfg/srv) documentation for more info on srv specific options.

## License
MIT
