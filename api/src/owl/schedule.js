import rp from 'request-promise';


export default function(cb) {
  const url = 'https://api.overwatchleague.com/schedule';

  const options = {
    uri: encodeURI(url),
    encoding: 'utf8',
    json: true,
  }

  rp(options).then((resp) => {
    const json = {
      data: resp.data,
    }

    cb(null, json);
  }).catch(err => {
    cb(err);
  });
}