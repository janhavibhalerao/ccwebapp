const mysql = require('mysql');
const Config = require('../config/config');
require('dotenv').config({ path: '/home/centos/webapp/var/.env' });
const conf = new Config();

//mysql database connection
module.exports = mysql.createConnection({
    host     : conf.db.host,
    user     : conf.db.user,
    port 	 : '3306',
    password : conf.db.password,
    database : conf.db.database
});