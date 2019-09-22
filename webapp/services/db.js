// connect to db

exports.getUser = ({ username, password }) => {
    // sql scripts to fetch user with username & password
    // user hardcoded for simplicity, store in a db for production applications
    if(username === 'admin' && password === 'password') {
    const user = { id: 1, username: 'admin', firstName: 'Test', lastName: 'User' };
    return user;
    } else {
        return null;
    }
}

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
