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
        id: resp.data.liveMatch.id,
        competitors: resp.data.liveMatch.competitors,
        round: resp.data.liveMatch.round,
        ordinal: resp.data.liveMatch.ordinal,
        scores: resp.data.liveMatch.scores,
        wins: resp.data.liveMatch.wins,
        losses: resp.data.liveMatch.losses,
        ties: resp.data.liveMatch.ties,
        startDate: resp.data.liveMatch.startDate,
        endDate: resp.data.liveMatch.endDate,
        startTime: resp.data.liveMatch.startDateTS,
        endTime: resp.data.liveMatch.endDateTS,
        started: resp.data.liveMatch.showStartTime,
        ended: resp.data.liveMatch.showEndTime,
        timeToMatch: resp.data.liveMatch.timeToMatch,
        status: resp.data.liveMatch.liveStatus,
    }

    cb(json);
  }).catch(err => {
    cb(err);
  });
}