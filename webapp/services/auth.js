const mysql = require('../services/db');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '/home/centos/webapp/var/.env' });
const SDC = require('statsd-client'),
sdc = new SDC({host: 'localhost'});
const log4js = require('log4js');
	log4js.configure({
	  appenders: { logs: { type: 'file', filename: '/home/centos/webapp/logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');

// To authenticate User (Basic Auth)
exports.authenticate = (req, res, next) => {
    sdc.increment('Auth Check Triggered');
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        logger.error('UnAuthorized');
        return res.status(401).json({ msg: 'Unauthorized' });
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];
    mysql.query('select * from User where email_address = (?)', [username], (err, data) => {
        if (data[0] != null) {
            bcrypt.compare(password, data[0].password, (err, result) => {
                if (result) {
                    const { password, ...userWithoutPassword } = data[0];
                    res.locals.user = userWithoutPassword;
                    logger.info('User Authorization Success');
                    next(); // authorized
                } else {
                    logger.error('UnAuthorized');
                    return res.status(401).json({ msg: 'Unauthorized' });
                }
            });

        } else {
            logger.error('UnAuthorized');
            return res.status(401).json({ msg: 'Unauthorized' });
        }
    })
}

