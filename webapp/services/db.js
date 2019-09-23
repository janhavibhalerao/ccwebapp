// connect to db
const mysql = require('mysql');

// mysql database connection
module.exports = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "Admin@123",
    database: "RMS"
});



exports.updateUser = (username) => {
    // sql scripts to update user with updateInfo
    for (const col of req.body) {
        colsToUpdate[col.name] = col.value;
    }

   connection.query("UPDATE Users SET ? WHERE username = '" + username + "'", { fieldsToUpdate }, function (error, results) {
       if (error) {
           res.status(404).json({
               message: error,
               field: fieldsToUpdate
           });
       } else {
           res.status(201).json({
               "record_count" : results.length,
               "error": null,
               "response": results
           });
       }
   });
}





