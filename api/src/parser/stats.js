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
    starEl: $('.player-rank').html(),
    rankEl: $('.player-level').html(),
  }

  if (parsed.endorsementFrameEl) {
    parsed.endorsementFrame = $('.masthead .EndorsementIcon').attr('style').slice(21, -1).replace(/ /g, '');
  }

  if (parsed.starEl !== null) {
    parsed.star = $('.player-level .player-rank').attr('style').slice(21, -1).replace(/ /g, '');
  }

  if (parsed.rankEl !== null) {
    parsed.rank = $('.player-level').attr('style').slice(21, -1).replace(/ /g, '');
  }

  const stats = {};

  // Top Heroes.
  const topHeroCategories = {
    quickplay: {
      'played': '0x0860000000000021',
      'games_won': '0x0860000000000039',
      'weapon_accuracy': '0x086000000000002F',
      'eliminations_per_life': '0x08600000000003D2',
      'multikill_best': '0x0860000000000346',
      'objective_kills_average': '0x086000000000039C',
    },
    competitive: {
      'played': '0x0860000000000021',
      'games_won': '0x0860000000000039',
      'win_rate': '0x08600000000003D1',
      'weapon_accuracy': '0x086000000000002F',
      'eliminations_per_life': '0x08600000000003D2',
      'multikill_best': '0x0860000000000346',
      'objective_kills_average': '0x086000000000039C',
    }
  };

  // Quickplay.
  stats['top_heroes'] = { quickplay: {} };
  Object.keys(topHeroCategories.quickplay).forEach((k) => {
    const topHeroesEls = $(`#quickplay [data-category-id="${topHeroCategories.quickplay[k]}"]`)
      .find('.progress-category-item');
    let topHeroes = [];
    topHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.ProgressBar-title').text();
      stat.img = $(this).find('.ProgressBar-thumb').attr('src');
      stat[k] = $(this).find('.ProgressBar-description').text();
      topHeroes.push(stat);
    });
    stats['top_heroes']['quickplay'][k] = topHeroes;
  });

  // Competitive.
  stats['top_heroes']['competitive'] = {};
  Object.keys(topHeroCategories.competitive).forEach((k) => {
    const topHeroesEls = $(`#competitive [data-category-id="${topHeroCategories.competitive[k]}"]`)
      .find('.progress-category-item');
    let topHeroes = [];
    topHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.ProgressBar-title').text();
      stat.img = $(this).find('.ProgressBar-thumb').attr('src');
      stat[k] = $(this).find('.ProgressBar-description').text();
      topHeroes.push(stat);
    });
    stats['top_heroes']['competitive'][k] = topHeroes;
  });

  //
  // Career Stats
  //
  const statCategories = [
    'Combat',
    'Match Awards',
    'Assists',
    'Average',
    'Miscellaneous',
    'Best',
    'Game'
  ];

  // Quickplay Stats.
  statCategories.forEach(function(item) {
    const els = $(`#quickplay [data-category-id="0x02E00000FFFFFFFF"] h5:contains("${item}")`).closest('table').find('tbody tr');
    let statsArr = [];
    els.each(function(i, el) {
      let stat = {};
      stat.title = $(this).find('td').first().text();
      stat.value = $(this).find('td').next().text();
      statsArr.push(stat);
    });
    item = item.replace(' ', '_').toLowerCase();
    stats[item] = { quickplay: [] };
    stats[item]['quickplay'] = statsArr;
  });

  // Competitive Stats.
  statCategories.forEach(function(item) {
    const els = $(`#competitive [data-category-id="0x02E00000FFFFFFFF"] h5:contains("${item}")`).closest('table').find('tbody tr');
    let statsArr = [];
    els.each(function(i, el) {
      let stat = {};
      stat.title = $(this).find('td').first().text();
      stat.value = $(this).find('td').next().text();
      statsArr.push(stat);
    });
    item = item.replace(' ', '_').toLowerCase();
    stats[item]['competitive'] = [];
    stats[item]['competitive'] = statsArr;
  });

  return callback(null, { stats, parsed });
}

// Transform the data into a json object we can serve.
function transform(results, callback) {
  const { parseHTML } = results;
  const { stats, parsed } = parseHTML;

  const endorsement = {
    sportsmanship: { value: parsed.sportsmanshipValue, rate: parseFloat((parsed.sportsmanshipValue * 100).toFixed(2)) },
    shotcaller: { value: parsed.shotcallerValue, rate: parseFloat((parsed.shotcallerValue * 100).toFixed(2)) },
    teammate: { value: parsed.teammateValue, rate: parseFloat((parsed.teammateValue * 100).toFixed(2)) },
    level: parseInt(parsed.endorsementLevel),
    frame: parsed.endorsementFrame,
  };
  endorsement.icon = createEndorsementSVG(endorsement);

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
    stats: stats
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