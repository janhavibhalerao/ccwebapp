const mysql = require('../services/db');
const bcrypt = require('bcrypt');
const config = require('./../config/config');
const { db: { database } } = config;

// To authenticate User (Basic Auth)
exports.authenticate = (req, res, next) => {

    let authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];
    mysql.query('select * from ' + database + '.User where email_address = (?)', [username], (err, data) => {
        if (data[0] != null) {
            bcrypt.compare(password, data[0].password, (err, result) => {
                if (result) {
                    const { password, ...userWithoutPassword } = data[0];
                    res.locals.user = userWithoutPassword;
                    next(); // authorized
                } else {
                    return res.status(401).json({ msg: 'Unauthorized' });
                }
            });

        } else {
            return res.status(401).json({ msg: 'Unauthorized' });
        }
    })
}

