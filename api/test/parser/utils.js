import test from 'ava';
import { getPrestigeLevel } from '../../src/parser/utils';

test('get the prestige level 0', t => {
    const code = "0x0250000000000918";
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 0);
});

test('get the prestige level 18', t => {
    const code = "69fde7abebb0bb5aa870e62362e84984cae13e441aec931a5e2c9dc5d22a56dc";
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 18);
});

test('get the prestige level default if not exists', t => {
    const code = "0xdeadc0de";
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