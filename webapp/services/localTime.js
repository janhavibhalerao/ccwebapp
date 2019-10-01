const moment = require('moment');
function toLocalTime (time) {
    let gmtDateTime = moment.utc(time, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    let local = gmtDateTime.local().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    return local;
};

module.exports = toLocalTime;