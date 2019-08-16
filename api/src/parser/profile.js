import path from 'path';
import async from 'async';
import cheerio from 'cheerio';
import request from 'request';
import { getPrestigeLevel, getPrestigeStars } from './utils';
import { createEndorsementSVG } from './svg';


// Get HTML from playoverwatch career page.
function getHTML(platform, region, tag, callback) {
  const url = platform === 'pc'
    ? `https://playoverwatch.com/en-us/career/${platform}/${region}/${tag}`
    : `https://playoverwatch.com/en-us/career/${platform}/${tag}`;

  const options = {
    uri: encodeURI(url),
    encoding: 'utf8'
  }

  return request(options, (err, res, body) => {
    return callback(err, body);
  });
}

// Begin html parsing.
function parseHTML(results, callback) {
  const $ = cheerio.load(results.getHTML);

  // Check if profile exists.
  const isFound = $('.content-box h1').text() !== 'Profile Not Found';
  if (!isFound) {
    return callback(new Error('Profile not found'));
  }

  const parsed = {
    user: $('.header-masthead').text(),
    level: $('.player-level div').first().text(),
    portrait: $('.player-portrait').attr('src'),
    permission: $('.masthead-permission-level-text').text(),
    endorsementLevel: $('.masthead .endorsement-level div').last().text(),
    endorsementFrameEl: $('.masthead .EndorsementIcon').attr('style'),
    sportsmanshipValue: $('.masthead .EndorsementIcon-border--sportsmanship').data('value'),
    shotcallerValue: $('.masthead .EndorsementIcon-border--shotcaller').data('value'),
    teammateValue: $('.masthead .EndorsementIcon-border--teammate').data('value'),
    quickplayWonEl: $('#quickplay td:contains("Games Won")').next().html(),
    quickplayPlayedEl: $('#quickplay td:contains("Games Played")').next().html(),
    quickplayTimePlayedEl: $('#quickplay td:contains("Time Played")').next().html(),
    compWonEl: $('#competitive td:contains("Games Won")').next().html(),
    compPlayedEl: $('#competitive td:contains("Games Played")').next().html(),
    compLostEl: $('#competitive td:contains("Games Lost")').next().html(),
    compDrawEl: $('#competitive td:contains("Games Tied")').next().html(),
    compTimePlayedEl: $('#competitive td:contains("Time Played")').next().html(),
    compRankEl: $('.competitive-rank'),
    levelFrameEl: $('.player-level').attr('style'),
    starEl: $('.player-rank').attr('style'),
    rankEl: $('.player-level').attr('style'),
  }

  if (parsed.compRankEl !== null) {
    parsed.compRankImgTank = $('.competitive-rank div[data-ow-tooltip-text="Tank Skill Rating"] img').attr('src') || null;
    parsed.compRankImgDamage = $('.competitive-rank div[data-ow-tooltip-text="Damage Skill Rating"] img').attr('src') || null;
    parsed.compRankImgSupport = $('.competitive-rank div[data-ow-tooltip-text="Support Skill Rating"] img').attr('src') || null;
    parsed.compRankElTank = $('.competitive-rank div[data-ow-tooltip-text="Tank Skill Rating"]').next().html();
    parsed.compRankElDamage = $('.competitive-rank div[data-ow-tooltip-text="Damage Skill Rating"]').next().html();
    parsed.compRankElSupport = $('.competitive-rank div[data-ow-tooltip-text="Support Skill Rating"]').next().html();
  }

  if (parsed.levelFrameEl) {
    parsed.levelFrame = parsed.levelFrameEl.slice(21, -1).replace(/ /g, '');
  }

  if (parsed.endorsementFrameEl) {
    parsed.endorsementFrame = parsed.endorsementFrameEl.slice(21, -1).replace(/ /g, '');
  }

  if (parsed.starEl) {
    parsed.star = parsed.starEl.slice(21, -1).replace(/ /g, '');
  }

  if (parsed.rankEl) {
    parsed.rank = parsed.rankEl.slice(21, -1).replace(/ /g, '');
  }
  return callback(null, parsed);
}

// Transform the data into a json object we can serve.
function transform(results, callback) {
  const { parseHTML: parsed } = results;

  const endorsement = {
    sportsmanship: { value: parsed.sportsmanshipValue, rate: parseFloat((parsed.sportsmanshipValue * 100).toFixed(2)) },
    shotcaller: { value: parsed.shotcallerValue, rate: parseFloat((parsed.shotcallerValue * 100).toFixed(2)) },
    teammate: { value: parsed.teammateValue, rate: parseFloat((parsed.teammateValue * 100).toFixed(2)) },
    level: parseInt(parsed.endorsementLevel),
    frame: parsed.endorsementFrame || null,
  };
  endorsement.icon = createEndorsementSVG(endorsement);

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

  // Calculate the prestige level.
  let level = parsed.level;
  if (parsed.star && parsed.rank) {
    const starsMatch = path.basename(parsed.star).split('.').slice(0, -1)[0];
    const rankMatch = path.basename(parsed.rank).split('.').slice(0, -1)[0];
    const stars = starsMatch ? getPrestigeStars(starsMatch) : 0;
    const rank = rankMatch ? getPrestigeLevel(rankMatch) : 0;
    const prestige = parseInt(stars) + parseInt(rank);
    level = parseInt(parsed.level) + (parseInt(prestige) * 100);
  }

  const json = {
    username: parsed.user,
    level: parseInt(level),
    portrait: parsed.portrait,
    endorsement: endorsement,
    private: parsed.permission === 'Private Profile',
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
    competitive: { 
      tank: {
        rank: parseInt(parsed.compRankElTank), 
        rank_img: parsed.compRankImgTank 
      },
      damage: {
        rank: parseInt(parsed.compRankElDamage), 
        rank_img: parsed.compRankImgDamage
      },
      support: {
        rank: parseInt(parsed.compRankElSupport), 
        rank_img: parsed.compRankImgSupport
      }
    },
    levelFrame: parsed.levelFrame,
    star: parsed.star
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