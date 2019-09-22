const mysql = require('mysql');

//mysql database connection
module.exports = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Admin@123",
    database: "RMS"
});