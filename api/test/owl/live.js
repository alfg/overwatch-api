import test from 'ava';
import { getLiveMatch } from '../../src/owl';

var result;

test.before.cb(t => {
  getLiveMatch((json) => {
    result = json;
    t.end();
  });
});

test('get base liveMatch data', t => {
  t.deepEqual(typeof(result.data), 'object');
  t.deepEqual(typeof(result.data.liveMatch), 'object');
});