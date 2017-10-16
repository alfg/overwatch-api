import test from 'ava';
import utils from '../app/utils';

const data = {
    "username": "Calvin",
    "level": 733,
    "portrait": "https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000EF7.png",
    "games": {
        "quickplay": {
            "won": 647
        },
        "competitive": {
            "won": 286,
            "lost": 186,
            "draw": 7,
            "played": 480
        }
    },
    "playtime": {
        "quickplay": "129 hours",
        "competitive": "99 hours"
    },
    "competitive": {
        "rank": 4582,
        "rank_img": "https://d1u1mce87gyfbn.cloudfront.net/game/rank-icons/season-2/rank-7.png"
    },
    "levelFrame": "https://d1u1mce87gyfbn.cloudfront.net/game/playerlevelrewards/0x0250000000000969_Border.",
    "star": "https://d1u1mce87gyfbn.cloudfront.net/game/playerlevelrewards/0x0250000000000969_Rank."
};

test('filter by username', t => {
    const filter = ["username"];
    const stats = utils.filterIncludes(filter, data);

    t.deepEqual(stats, { username: "Calvin" });
});

test('filter by level', t => {
    const filter = ["level"];
    const stats = utils.filterIncludes(filter, data);

    t.deepEqual(stats, { level: 733 });
});

test('filter by games.competitive', t => {
    const filter = ["games", "competitive"];
    const stats = utils.filterIncludes(filter, data);

    t.deepEqual(stats, {
        games: {
            competitive: {
                won: 286, lost: 186, draw: 7, played: 480
            }
        }
    });
});

test('filter by invalid key', t => {
    const filter = ["asdf"];
    const stats = utils.filterIncludes(filter, data);
    
    t.deepEqual(stats, data);
});