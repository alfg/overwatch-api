import test from 'ava';
import { getPrestigeLevel } from '../../app/parser/utils';


test('get the prestige level 0', t => {
    const code = '0x0250000000000918';
    const level = getPrestigeLevel(code);

    t.deepEqual(level, 0);
});

