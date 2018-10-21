const overwatch = require('overwatch-api');

const platform = 'psn';
const region = 'global';
const tag = 'Drollestmaple03';

overwatch.getProfile(platform, region, tag, (err, json) => {
    console.log(json);
});