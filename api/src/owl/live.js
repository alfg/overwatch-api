import rp from 'request-promise';


export default function(cb) {
  const url = 'https://api.overwatchleague.com/live-match';

  const options = {
    uri: encodeURI(url),
    encoding: 'utf8',
    json: true,
  }

  rp(options).then((resp) => {
    const json = {
      data: transform(resp.data),
    }

    cb(null, json);
  }).catch(err => {
    cb(err);
  });
}

function transform(data) {
  let t;

  if (Object.getOwnPropertyNames(data.liveMatch).length === 0) {
    t = {
      liveMatch: {},
    }
    return t;
  }

  t = {
    liveMatch: {
      competitors: data.liveMatch.competitors.map(o =>
        ({
          name: o.name,
          primaryColor: o.primaryColor,
          secondaryColor: o.secondaryColor,
          abbreviatedName: o.abbreviatedName,
          logo: o.logo,
        })
      ),
      scores: data.liveMatch.scores,
      status: data.liveMatch.status,
      games: data.liveMatch.games.map(o => 
        ({
          number: o.number,
          points: o.points,
          state: o.state,
          map: o.attributes.map
        })
      ),
      startDate: data.liveMatch.startDate,
      endDate: data.liveMatch.endDate,
      wins: data.liveMatch.wins,
      ties: data.liveMatch.ties,
      losses: data.liveMatch.losses,
      timeToMatch: data.liveMatch.timeToMatch,
      liveStatus: data.liveMatch.liveStatus,
    }
  }
  return t;
}