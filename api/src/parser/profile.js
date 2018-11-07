import async from 'async';
import cheerio from 'cheerio';
import rp from 'request-promise';
import { getPlatforms } from './utils';
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

  return rp(options).then((htmlString) => {
    return callback(null, htmlString);
  }).catch(err => {
    return callback(err);
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
    endorsementFrame: $('.masthead .EndorsementIcon').attr('style').slice(21, -1),
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
    levelFrame: $('.player-level').attr('style').slice(21, -1),
    starEl: $('.player-level .player-rank').html(),
  }

  if (parsed.compRankEl !== null) {
    parsed.compRankImg = $('.competitive-rank img').attr('src') || null;
    parsed.compRank = $('.competitive-rank div').html();
  }

  if (parsed.starEl !== null) {
    parsed.star = $('.player-level .player-rank').attr('style').slice(21, -1);
  }
  return callback(null, parsed);
}

// Get prestige level by finding the user id and making an xhr request
// to get the level.
function getPlatformsData(results, callback) {
    const $ = cheerio.load(results.getHTML);
    const scriptEl = $('script').filter(function() {
      return $(this).text().trim().includes('window.app.career.init');
    });
    const id = scriptEl.text().match(/([0-9])\w+/)[0];

    getPlatforms(id, (err, json) => {
      return callback(null, json);
    });
}

// Transform the data into a json object we can serve.
function transform(results, callback) {
  const { parseHTML: parsed, getPlatformsData: platform } = results;

  const endorsement = {
    sportsmanship: { value: parsed.sportsmanshipValue, rate: parseFloat((parsed.sportsmanshipValue * 100).toFixed(2)) },
    shotcaller: { value: parsed.shotcallerValue, rate: parseFloat((parsed.shotcallerValue * 100).toFixed(2)) },
    teammate: { value: parsed.teammateValue, rate: parseFloat((parsed.teammateValue * 100).toFixed(2)) },
    level: parseInt(parsed.endorsementLevel),
    frame: parsed.endorsementFrame,
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

  const json = {
    username: parsed.user,
    level: platform.playerLevel,
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
    competitive: { rank: parseInt(parsed.compRank), rank_img: parsed.compRankImg },
    levelFrame: parsed.levelFrame,
    star: parsed.star
  }
  return callback(null, json);
}

export default function(platform, region, tag, callback) {
  async.auto({
    getHTML: async.apply(getHTML, platform, region, tag),
    parseHTML: ['getHTML', async.apply(parseHTML)],
    getPlatformsData: ['getHTML', async.apply(getPlatformsData)],
    transform: ['getHTML', 'parseHTML', 'getPlatformsData', async.apply(transform)],
  }, function(err, results) {
    if (err) {
      return callback(err);
    }
    return callback(null, results.transform);
  });
}