const mysql = require('mysql');
const config = require('./../config/config');
const { mysql: { host, user, password, database } } = config;
//mysql database connection
module.exports = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
   });