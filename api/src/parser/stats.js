import async from 'async';
import cheerio from 'cheerio';
import { retryRequest } from './utils';

const MAX_RETRIES = 3;

// Get HTML from playoverwatch career page.
function getHTML(platform, region, tag, callback) {
  const url = `https://overwatch.blizzard.com/en-us/career/${tag}/`

  const options = {
    uri: encodeURI(url),
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
    const topHeroesEls = $(`.Profile-heroSummary--view.quickPlay-view [data-category-id="${topHeroCategories.quickplay[k]}"]`)
      .find('.Profile-progressBar');
    let topHeroes = [];
    topHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.Profile-progressBar-title').text();
      stat.img = $(this).find('.Profile-progressBar--icon').attr('src');
      stat[k] = $(this).find('.Profile-progressBar-description').text();
      topHeroes.push(stat);
    });
    stats['top_heroes']['quickplay'][k] = topHeroes;
  });

  // Competitive.
  stats['top_heroes']['competitive'] = {};
  Object.keys(topHeroCategories.competitive).forEach((k) => {
    const topHeroesEls = $(`.Profile-heroSummary--view.competitive-view [data-category-id="${topHeroCategories.competitive[k]}"]`)
      .find('.Profile-progressBar');
    let topHeroes = [];
    topHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.Profile-progressBar-title').text();
      stat.img = $(this).find('.Profile-progressBar--icon').attr('src');
      stat[k] = $(this).find('.Profile-progressBar-description').text();
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
    const els = $(`.stats.quickPlay-view .option-0 .category .content .header p:contains("${item}")`).closest('.content').find('.stat-item');
    let statsArr = [];
    els.each(function(i, el) {
      let stat = {};
      stat.title = $(this).find('.name').text();
      stat.value = $(this).find('.value').text();
      statsArr.push(stat);
    });
    item = item.replace(' ', '_').toLowerCase();
    stats[item] = { quickplay: [] };
    stats[item]['quickplay'] = statsArr;
  });

  // Competitive Stats.
  statCategories.forEach(function(item) {
    const els = $(`.stats.competitive-view .option-0 .category .content .header p:contains("${item}")`).closest('.content').find('.stat-item');
    let statsArr = [];
    els.each(function(i, el) {
      let stat = {};
      stat.title = $(this).find('.name').text();
      stat.value = $(this).find('.value').text();
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

  const json = {
    username: parsed.user,
    portrait: parsed.portrait,
    endorsement: parsed.endorsementImage,
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