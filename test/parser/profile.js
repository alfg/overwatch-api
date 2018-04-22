import test from 'ava';
import parser from '../../src/parser';

const platform = 'pc'
const region = 'us'
const tag = 'Calvin-1337'

var result;

test.before.cb(t => {
  parser.profile(platform, region, tag, (json) => {
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
});

test('get information of user playtime', t => {
  t.deepEqual(typeof(result.playtime.quickplay), 'string');
  t.deepEqual(typeof(result.playtime.competitive), 'string');
});

test('get information of user competitive stats', t => {
  t.deepEqual(typeof(result.competitive.rank), 'number');
  t.deepEqual(result.competitive.rank_img.startsWith('http'), true);
});
