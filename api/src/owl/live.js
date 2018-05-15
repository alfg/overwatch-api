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
      data: resp.data,
    }

    cb(json);
  }).catch(err => {
    cb(err);
  });
}