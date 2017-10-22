import test from 'ava';
import parseStats from '../../app/parser/stats';

const platform = 'pc'
const region = 'us'
const tag = 'Alf-1608'

var result;

test.before.cb(t => {
  parseStats(platform, region, tag, (json) => {
    result = json;
    t.end();
  })
});

test('get base information of user profile', t => {
  t.deepEqual(typeof(result.username), 'string');
  t.deepEqual(typeof(result.level), 'number');
  t.deepEqual(result.portrait.startsWith('http'), true);
});

test('get user top heroes information', t => {
  result['stats']['top_heroes']['quickplay'].map((hero) => {
    t.deepEqual(typeof(hero['hero']), 'string');
    t.deepEqual(typeof(hero['played']), 'string');
    t.deepEqual(hero.img.startsWith('http'), true);
  });

  result['stats']['top_heroes']['competitive'].map((hero) => {
    t.deepEqual(typeof(hero['hero']), 'string');
    t.deepEqual(typeof(hero['played']), 'string');
    t.deepEqual(hero.img.startsWith('http'), true);
  });
});

test('get combat stats', t => {
  t.is(result['stats']['combat']['quickplay'].length > 0, true);
  result['stats']['combat']['quickplay'].map((stat) => {
    t.deepEqual(typeof(stat.title), 'string');
    t.deepEqual(typeof(stat.value), 'string');
  });

  t.is(result['stats']['combat']['competitive'].length > 0, true);
  result['stats']['combat']['competitive'].map((stat) => {
    t.deepEqual(typeof(stat.title), 'string');
    t.deepEqual(typeof(stat.value), 'string');
  });
});

test('get death stats', t => {
  t.is(result['stats']['deaths']['quickplay'].length > 0, true);
  result['stats']['deaths']['quickplay'].map((stat) => {
    t.deepEqual(typeof(stat.title), 'string');
    t.deepEqual(typeof(stat.value), 'string');
  });

  t.is(result['stats']['deaths']['competitive'].length > 0, true);
  result['stats']['deaths']['competitive'].map((stat) => {
    t.deepEqual(typeof(stat.title), 'string');
    t.deepEqual(typeof(stat.value), 'string');
  });
});

