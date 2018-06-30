import test from 'ava';
import { createEndorsementSVG } from '../../src/parser/svg';

test('create a valid endorsement SVG', t => {
    const endorsementData = {
      sportsmanship: { value: 18, rate: 31.58 },
      shotcaller: { value: 4, rate: 7.02  },
      teammate: { value: 35, rate: 61.4 },
      points: 57,
      level: 2,
    };

    const svg = createEndorsementSVG(endorsementData);
    const decoded = Buffer.from(svg.slice('data:image/svg+xml;base64,'.length), 'base64').toString('utf8');

    t.true(svg.startsWith('data:image/svg+xml;base64,'));
    t.regex(svg, /[A-Za-z0-9+/=]/);
    t.true(decoded.startsWith('<svg'));
    t.true(decoded.endsWith('</svg>'));
});