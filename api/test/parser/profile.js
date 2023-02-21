import test from 'ava';
import { getProfile } from '../../src/parser';

const platform = 'pc'
const region = 'us'
const tag = 'Jay3-11894'

var result;

test.before.cb(t => {
  getProfile(platform, region, tag, (err, json) => {
    if (err) t.fail();

    result = json;
    t.end();
  })
});

test('get base information of user profile', t => {
  t.deepEqual(typeof(result.username), 'string');
  t.deepEqual(result.portrait.startsWith('http'), true);
});

test('get information of games played by user', t => {
  t.deepEqual(typeof(result.games.quickplay.won), 'number');
  t.deepEqual(typeof(result.games.competitive.won), 'number');
  t.deepEqual(typeof(result.games.competitive.lost), 'number');
  t.deepEqual(typeof(result.games.competitive.draw), 'number');
  t.deepEqual(typeof(result.games.competitive.played), 'number');
  t.deepEqual(typeof(result.games.competitive.win_rate), 'number');
});

test('get information of user playtime', t => {
  t.not(typeof(result.playtime.quickplay), 'undefined');
  t.not(typeof(result.playtime.competitive), 'undefined');
});

test('get information of user competitive stats', t => {
  t.deepEqual(typeof(result.competitive.tank.rank), 'string');
  t.deepEqual(result.competitive.tank.icon.startsWith('http'), true);
  t.deepEqual(typeof(result.competitive.offense.rank), 'string');
  t.deepEqual(result.competitive.offense.icon.startsWith('http'), true);
  t.deepEqual(typeof(result.competitive.support.rank), 'string');
  t.deepEqual(result.competitive.support.icon.startsWith('http'), true);
});
