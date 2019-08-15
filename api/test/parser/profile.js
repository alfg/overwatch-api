import test from 'ava';
import { getProfile } from '../../src/parser';

const platform = 'pc'
const region = 'us'
const tag = 'xQc-11273'

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
  t.deepEqual(typeof(result.level), 'number');
  t.deepEqual(result.portrait.startsWith('http'), true);
  t.deepEqual(result.levelFrame.startsWith('http'), true);
  t.deepEqual(result.star.startsWith('http'), true);
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
  t.deepEqual(typeof(result.competitive.tank.rank), 'number');
  t.deepEqual(result.competitive.tank.rank_img.startsWith('http'), true);
  t.deepEqual(typeof(result.competitive.damage.rank), 'number');
  t.deepEqual(result.competitive.damage.rank_img.startsWith('http'), true);
  t.deepEqual(typeof(result.competitive.support.rank), 'number');
  t.deepEqual(result.competitive.support.rank_img.startsWith('http'), true);
});
