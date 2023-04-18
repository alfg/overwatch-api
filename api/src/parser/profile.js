import async from 'async';
import cheerio from 'cheerio';
import { retryRequest } from './utils';

const MAX_RETRIES = 3;

// Get HTML from playoverwatch career page.
function getHTML(platform, region, tag, callback) {
  const url = `https://overwatch.blizzard.com/en-us/career/${tag}/`
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:112.0) Gecko/20100101 Firefox/112.0';

  const options = {
    uri: encodeURI(url),
    headers: {
      'User-Agent': ua,
    },
    encoding: 'utf8'
  }
  return retryRequest(options, MAX_RETRIES, callback);
}

// Begin html parsing.
function parseHTML(results, callback) {
  const $ = cheerio.load(results.getHTML);

  // Check if profile exists.
  const isFound = $('.heading').text() !== 'Page Not Found';
  if (!isFound) {
    return callback(new Error('Profile not found'));
  }

  const parsed = {
    user: $('.Profile-player--name').text(),
    portrait: $('.Profile-player--portrait').attr('src'),
    title: $('.Profile-player---title').text(),
    permission: $('.Profile-private---msg').text(),
    endorsementImage: $('.Profile-playerSummary--endorsement').attr('src'),
    quickplayWonEl: $('.stats.quickPlay-view p:contains("Games Won")').next().html(),
    quickplayPlayedEl: $('.stats.quickPlay-view p:contains("Games Played")').next().html(),
    quickplayTimePlayedEl: $('.stats.quickPlay-view p:contains("Time Played")').next().html(),
    compWonEl: $('.stats.competitive-view p:contains("Games Won")').next().html(),
    compPlayedEl: $('.stats.competitive-view p:contains("Games Played")').next().html(),
    compLostEl: $('.stats.competitive-view p:contains("Games Lost")').next().html(),
    compDrawEl: $('.stats.competitive-view p:contains("Games Tied")').next().html(),
    compTimePlayedEl: $('.stats.competitive-view p:contains("Time Played")').next().html(),
    compRankEls: $('.Profile-playerSummary--rankWrapper').find('.Profile-playerSummary--roleWrapper'),
  }

  if (parsed.compRankEls) {
    const r = {};
    parsed.compRankEls.each((i, elem) => {
      const rankImgSrc = $(elem).find('img.Profile-playerSummary--rank').attr('src');
      const roleImgSrc = $(elem).find('.Profile-playerSummary--role img').attr('src');
      const rankParsed = rankImgSrc.split('/').pop().split('#')[0].split('-');
      const role = roleImgSrc.split('/').pop().split('#')[0].split('-')[0];

      const rank = `${rankParsed[0].replace('Tier', '')} ${rankParsed[1]}`;
      const obj = { rank, icon: rankImgSrc };
      r[role] = obj;
    });

    parsed.ranks = r;
  }

  return callback(null, parsed);
}

// Transform the data into a json object we can serve.
function transform(results, callback) {
  const { parseHTML: parsed } = results;

  const won = {};
  const lost = {};
  const draw = {};
  const played = {};
  const time = {};

  if (parsed.quickplayWonEl !== null) {
    won.quickplay = parsed.quickplayWonEl.trim().replace(/,/g, '');
  }

  if (parsed.quickplayPlayedEl !== null) {
    played.quickplay = parsed.quickplayPlayedEl.trim().replace(/,/g, '');
  }

  if (parsed.quickplayTimePlayedEl !== null) {
    time.quickplay = parsed.quickplayTimePlayedEl.trim().replace(/,/g, '');
  }

  if (parsed.compWonEl !== null) {
    won.competitive = parsed.compWonEl.trim().replace(/,/g, '');
  }

  if (parsed.compLostEl !== null) {
    lost.competitive = parsed.compLostEl.trim().replace(/,/g, '');
  }

  if (parsed.compDrawEl !== null) {
    draw.competitive = parsed.compDrawEl.trim().replace(/,/g, '');
  }

  if (parsed.compPlayedEl !== null) {
    played.competitive = parsed.compPlayedEl.trim().replace(/,/g, '');
  }

  if (parsed.compTimePlayedEl !== null) {
    time.competitive = parsed.compTimePlayedEl.trim().replace(/,/g, '');
  }

  const json = {
    username: parsed.user,
    portrait: parsed.portrait,
    endorsement: parsed.endorsementImage,
    private: parsed.permission === 'THIS PROFILE IS CURRENTLY PRIVATE',
    games: {
      quickplay: {
        won: parseInt(won.quickplay),
        played: parseInt(played.quickplay) || undefined 
      },
      competitive: {
        won: parseInt(won.competitive),
        lost: parseInt(lost.competitive),
        draw: parseInt(draw.competitive) || 0,
        played: parseInt(played.competitive),
        win_rate: parseFloat((parseInt(won.competitive) / (parseInt(played.competitive - parseInt(draw.competitive))) * 100).toFixed(2)),
      },
    },
    playtime: { quickplay: time.quickplay, competitive: time.competitive },
    competitive: parsed.ranks,
  }

  return callback(null, json);
}

export default function(platform, region, tag, callback) {
  async.auto({
    getHTML: async.apply(getHTML, platform, region, tag),
    parseHTML: ['getHTML', async.apply(parseHTML)],
    transform: ['getHTML', 'parseHTML', async.apply(transform)],
  }, function(err, results) {
    if (err) {
      return callback(err);
    }
    return callback(null, results.transform);
  });
}