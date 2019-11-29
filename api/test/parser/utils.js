import test from 'ava';
import { getPrestigeLevel, getPrestigeStars } from '../../src/parser/utils';

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

test('returns 0 stars by default', t => {
    const stars = getPrestigeStars('');
    t.is(stars, 0);
});

test('returns stars for uuid', t => {
    const stars = getPrestigeStars('cff520765f143c521b25ad19e560abde9a90eeae79890b14146a60753d7baff8');
    t.is(stars, 4);
});
