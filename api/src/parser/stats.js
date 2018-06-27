import cheerio from 'cheerio';
import rp from 'request-promise';
import { getPrestigeLevel } from './utils';

export default function(platform, region, tag, cb) {

  const url = platform === 'pc'
    ? `https://playoverwatch.com/en-us/career/${platform}/${region}/${tag}`
    : `https://playoverwatch.com/en-us/career/${platform}/${tag}`;

  const options = {
    uri: encodeURI(url),
    encoding: 'utf8'
  }

  rp(options).then((htmlString) => {

    // Begin html parsing.
    const $ = cheerio.load(htmlString);
    const user = $('.header-masthead').text();
    const level = $('.player-level div').first().text();
    const portrait = $('.player-portrait').attr('src');
    const permission = $('.masthead-permission-level-text').text();

    // Get prestige level by matching .player-level background url hex.
    const prestigeEl = $('.player-level').first().attr('style');
    const prestigeHex = prestigeEl.match(/0x0*[1-9a-fA-F][0-9a-fA-F]*/);
    const prestigeLevel = prestigeHex ? getPrestigeLevel(prestigeHex[0]) : 0;

    const stats = {};

    //
    // Top Heroes.
    //
    const topHeroCategories = {
      quickplay: {
        'played': '0x0860000000000021',
        'games_won': '0x0860000000000039',
      },
      competitive: {
        'played': '0x0860000000000021',
        'games_won': '0x0860000000000039',
        'win_rate': '0x08600000000003D1',
      }
    };

    // Quickplay.
    stats['top_heroes'] = { quickplay: {} };
    Object.keys(topHeroCategories.quickplay).forEach((k) => {
      const topHeroesEls = $(`#quickplay [data-category-id="overwatch.guid.${topHeroCategories.quickplay[k]}"]`)
        .find('.progress-category-item');
      let topHeroes = [];
      topHeroesEls.each(function(i, el) {
        const stat = {};
        stat.hero = $(this).find('.title').text();
        stat.img = $(this).find('img').attr('src');
        stat[k] = $(this).find('.description').text();
        topHeroes.push(stat);
      });
      stats['top_heroes']['quickplay'][k] = topHeroes;
    });

    // Competitive.
    stats['top_heroes']['competitive'] = {};
    Object.keys(topHeroCategories.competitive).forEach((k) => {
      const topHeroesEls = $(`#competitive [data-category-id="overwatch.guid.${topHeroCategories.competitive[k]}"]`)
        .find('.progress-category-item');
      let topHeroes = [];
      topHeroesEls.each(function(i, el) {
        const stat = {};
        stat.hero = $(this).find('.title').text();
        stat.img = $(this).find('img').attr('src');
        stat[k] = $(this).find('.description').text();
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

    const json = {
      username: user,
      level: parseInt(level) + prestigeLevel,
      portrait: portrait,
      private: permission === 'Private Profile',
      stats: stats
    }

    cb(null, json);
  }).catch(err => {
    cb(err);
  });
}
