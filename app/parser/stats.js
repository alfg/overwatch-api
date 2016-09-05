const cheerio = require('cheerio');
const rp = require('request-promise');

export default function(platform, region, tag, cb) {

  let url = `https://playoverwatch.com/en-us/career/${platform}/${region}/${tag}`;

  rp(url).then((htmlString) => {

    // Begin html parsing.
    const $ = cheerio.load(htmlString);
    const user = $('.header-masthead').text();

    const stats = {
      top_heroes: {
        quickplay: [],
        competitive: []
      },
      combat: {
        quickplay: [],
        competitive: []
      }
    };

    const quickplayTopHeroesEls = $('#quick-play [data-category-id="overwatch.guid.0x0860000000000021"]')
      .find('.progress-category-item');

    const compTopHeroesEls = $('#competitive-play [data-category-id="overwatch.guid.0x0860000000000021"]')
      .find('.progress-category-item');

    // Populate topHeroes.
    let quickplayTopHeroes = [];
    quickplayTopHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.title').text();
      stat.played = $(this).find('.description').text();
      stat.img = $(this).find('img').attr('src');
      quickplayTopHeroes.push(stat);
    });
    stats['top_heroes']['quickplay'] = quickplayTopHeroes;

    let compTopHeroes = [];
    compTopHeroesEls.each(function(i, el) {
      const stat = {};
      stat.hero = $(this).find('.title').text();
      stat.played = $(this).find('.description').text();
      stat.img = $(this).find('img').attr('src');
      compTopHeroes.push(stat);
    });
    stats['top_heroes']['competitive'] = compTopHeroes;

    // Career Stats
    const quickplayCombatEls = $('#quick-play [data-category-id="0x02E00000FFFFFFFF"] span:contains("Combat")').closest('table').find('tbody tr');
    let quickplayCombatStats = [];
    quickplayCombatEls.each(function(i, el) {
      const stat = {};
      stat.title = $(this).find('td').text();
      stat.value = $(this).find('td').next().text();
      quickplayCombatStats.push(stat);
    });
    stats['combat']['quickplay'] = quickplayCombatStats;

    const compCombatEls = $('#competitive-play [data-category-id="0x02E00000FFFFFFFF"] span:contains("Combat")').closest('table').find('tbody tr');
    let compCombatStats = [];
    compCombatEls.each(function(i, el) {
      let stat = {};
      stat.title = $(this).find('td').text();
      stat.value = $(this).find('td').next().text();
      compCombatStats.push(stat);
    });
    stats['combat']['competitive'] = compCombatStats;

    const json = {
      username: user,
      stats: stats
    }

    cb(json);
  });
}
