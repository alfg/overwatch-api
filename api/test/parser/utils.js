import test from 'ava';
import { getPrestigeLevel, getPlatforms } from '../../src/parser/utils';


const id = '50284944'; // xQc#11273
var result;

test.before.cb(t => {
  getPlatforms(id, (err, json) => {
    if (err) t.fail();

    result = json;
    t.end();
  });
});

test('get the prestige level 0', t => {
    const code = "0x0250000000000918";
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 0);
});

test('get the prestige level 1700', t => {
    const code = "0x02500000000009CD";
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 1700);
});

test('get the prestige level default if not exists', t => {
    const code = "0x02500000";
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 0);
});

test('get the prestige level default if not exists as integer', t => {
    const code = 12345;
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 0);
});

test('get the prestige level default if given a bad value', t => {
    const code = "!@#!!";
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 0);
});

test('get prestige level using getPlatforms', t => {
    t.deepEqual(typeof(result.id), 'number');
    t.deepEqual(typeof(result.playerLevel), 'number');
    t.deepEqual(result.name, 'xQc#11273');
});

