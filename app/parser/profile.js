const cheerio = require('cheerio');
const rp = require('request-promise');

export default function(platform, region, tag, cb) {

  const url = `https://playoverwatch.com/en-us/career/${platform}/${region}/${tag}`;

  rp(url).then((htmlString) => {

    // Begin html parsing.
    const $ = cheerio.load(htmlString);
    const user = $('.header-masthead').text();
    const won = {};
    const lost = {};
    const played = {};
    const time = {};

    let compRank;
    let compRankImg;
    let star = '';

    const quickplayWonEl = $('#quick-play td:contains("Games Won")').next().html();
    const quickplayPlayedEl = $('#quick-play td:contains("Games Played")').next().html();
    const quickplayTimePlayedEl = $('#quick-play td:contains("Time Played")').next().html();

    const compWonEl = $('#competitive-play td:contains("Games Won")').next().html();
    const compPlayedEl = $('#competitive-play td:contains("Games Played")').next().html();
    const compTimePlayedEl = $('#competitive-play td:contains("Time Played")').next().html();
    const compRankEl = $('.competitive-rank');

    const levelFrame = $('.player-level').attr('style').slice(21, 109);
    const starEl = $('.player-level .player-rank').html();

    if (compRankEl !== null) {
      compRankImg = $('.competitive-rank img').attr('src');
      compRank = $('.competitive-rank div').html();
    }

    if (quickplayWonEl !== null) {
      won.quickplay = quickplayWonEl.trim().replace(/,/g, '');
    }

    if (quickplayPlayedEl !== null) {
      played.quickplay = quickplayPlayedEl.trim().replace(/,/g, '');
      lost.quickplay = played.quickplay - won.quickplay;
    }

    if (quickplayTimePlayedEl !== null) {
      time.quickplay = quickplayTimePlayedEl.trim().replace(/,/g, '');
    }

    if (compWonEl !== null) {
      won.competitive = compWonEl.trim().replace(/,/g, '');
    }

    if (compPlayedEl !== null) {
      played.competitive = compPlayedEl.trim().replace(/,/g, '');
      lost.competitive = played.competitive - won.competitive;
    }

    if (compTimePlayedEl !== null) {
      time.competitive = compTimePlayedEl.trim().replace(/,/g, '');
    }

    if (starEl !== null) {
      star = $('.player-level .player-rank').attr('style').slice(21, 107);
    }

    const json = {
      username: user,
      games: {
        quickplay: { wins: won.quickplay, lost: lost.quickplay, played: played.quickplay },
        competitive: { wins: won.competitive, lost: lost.competitive, played: played.competitive },
      },
      playtime: { quickplay: time.quickplay, competitive: time.competitive },
      competitive: { rank: compRank, rank_img: compRankImg },
      levelFrame: levelFrame,
      star: star
    }

    cb(json);
  });
}
