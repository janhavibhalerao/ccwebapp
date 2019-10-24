const mysql = require('mysql');
const config = require('./../config/config');
const { db: { host, user, password, database, port } } = config;
//mysql database connection
module.exports = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
    port: port
   });