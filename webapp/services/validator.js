
const myDb = require('./db');

exports.validateUser = ({ username, password }) => {
    let user = myDb.getUser({ username, password });
    if (user) {
        return user;
    } else {
        return null;
    }
}

