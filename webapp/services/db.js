var mysql = require('mysql');

//mysql database connection
module.exports = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "users"
});