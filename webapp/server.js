const express = require('express');
const path = require('path');
const logger = require('morgan');

const auth = require('./services/auth');
const usersRouter = require('./routes/user');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/v1/user', usersRouter);



function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ message: err });
    }

    // default to 500 server error
    return res.status(500).json({ message: err.message });
}

app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 4000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
  
module.exports = app;