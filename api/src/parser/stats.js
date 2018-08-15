import cheerio from 'cheerio';
import rp from 'request-promise';
import { getPrestigeLevel } from './utils';
import { createEndorsementSVG } from './svg';

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

    // Endorsements.
    const endorsementLevel = $('.masthead .endorsement-level div').last().text();
    const endorsementFrame = $('.masthead .EndorsementIcon').attr('style').slice(21, -1);

    const sportsmanshipValue = $('.masthead .EndorsementIcon-border--sportsmanship').data('value');
    const shotcallerValue = $('.masthead .EndorsementIcon-border--shotcaller').data('value');
    const teammateValue = $('.masthead .EndorsementIcon-border--teammate').data('value');

    const endorsement = {
      sportsmanship: { value: sportsmanshipValue, rate: parseFloat((sportsmanshipValue * 100).toFixed(2)) },
      shotcaller: { value: shotcallerValue, rate: parseFloat((shotcallerValue * 100).toFixed(2)) },
      teammate: { value: teammateValue, rate: parseFloat((teammateValue * 100).toFixed(2)) },
      level: parseInt(endorsementLevel),
      frame: endorsementFrame,
    };

    endorsement.icon = createEndorsementSVG(endorsement);

    const stats = {};

    //
    // Top Heroes.
    //
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
      endorsement: endorsement,
      private: permission === 'Private Profile',
      stats: stats
    }

    cb(null, json);
  }).catch(err => {
    cb(err);
  });
}
