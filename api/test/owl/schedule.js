import test from 'ava';
import { getSchedule } from '../../src/owl';

var result;

test.before.cb(t => {
  getSchedule((err, json) => {
    if (err) t.fail();

    result = json;
    t.end();
  });
});

test('get base schedule data', t => {
  t.deepEqual(typeof(result.data), 'object');
  t.deepEqual(typeof(result.data.startDate), 'string');
  t.deepEqual(typeof(result.data.endDate), 'string');
  t.deepEqual(Array.isArray(result.data.stages), true);
  t.deepEqual(result.data.stages.length > 0, true);
});