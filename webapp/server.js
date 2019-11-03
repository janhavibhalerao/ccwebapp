const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const usersRouter = require('./routes/user');
const recipeRouter = require('./routes/recipe');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/v1/user', usersRouter);
app.use('/v1/recipe', recipeRouter);
app.use('/v1/recipes', recipeRouter);

//error handling
app.use((req, res, next) => {
    const error = new Error('NOT FOUND');
    error.status = 404;
    next(error);
})
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json();
});


// app.listen(PORT,() => {
//     console.log(`Server listening on port: ${PORT}`);
// });

//create app server
var server = app.listen(3000, function () {
    logger.trace('App started');
    var host = server.address().address
    var port = server.address().port
    console.log("RMS app listening to http://%s:%s", host, port)
});
  
module.exports = app;
