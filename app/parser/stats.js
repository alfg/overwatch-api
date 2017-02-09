const cheerio = require('cheerio');
const rp = require('request-promise');

export default function(platform, region, tag, cb) {

  const url = `https://playoverwatch.com/en-us/career/${platform}/${region}/${tag}`;

  rp(url).then((htmlString) => {

    // Begin html parsing.
    const $ = cheerio.load(htmlString);
    const user = $('.header-masthead').text();
    const level = $('.player-level div').first().text();
    const portrait = $('.player-portrait').attr('src');

    const stats = {};

    //
    // Top Heroes.
    //

    // Quickplay.
    const quickplayTopHeroesEls = $('#quickplay [data-category-id="overwatch.guid.0x0860000000000021"]')
      .find('.progress-category-item');
    let quickplayTopHeroes = [];
    quickplayTopHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.title').text();
      stat.played = $(this).find('.description').text();
      stat.img = $(this).find('img').attr('src');
      quickplayTopHeroes.push(stat);
    });
    stats['top_heroes'] = { quickplay: [] };
    stats['top_heroes']['quickplay'] = quickplayTopHeroes;

    // Competitive.
    const compTopHeroesEls = $('#competitive [data-category-id="overwatch.guid.0x0860000000000021"]')
      .find('.progress-category-item');
    let compTopHeroes = [];
    compTopHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.title').text();
      stat.played = $(this).find('.description').text();
      stat.img = $(this).find('img').attr('src');
      compTopHeroes.push(stat);
    });
    stats['top_heroes']['competitive'] = [];
    stats['top_heroes']['competitive'] = compTopHeroes;

    //
    // Career Stats
    //
    const statCategories = [
      'Combat',
      'Deaths',
      'Match Awards',
      'Assists',
      'Average',
      'Miscellaneous',
      'Best',
      'Game'
    ];

    // Quickplay Stats.
    statCategories.forEach(function(item) {
      const els = $(`#quickplay [data-category-id="0x02E00000FFFFFFFF"] span:contains("${item}")`).closest('table').find('tbody tr');
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
      const els = $(`#competitive [data-category-id="0x02E00000FFFFFFFF"] span:contains("${item}")`).closest('table').find('tbody tr');
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
      level: parseInt(level),
      portrait: portrait,
      stats: stats
    }

    cb(json);
  }).catch(err => {
    cb(err);
  });
}
