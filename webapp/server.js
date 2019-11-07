const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const usersRouter = require('./routes/user');
const recipeRouter = require('./routes/recipe');
const log4js = require('log4js');
	log4js.configure({
	  appenders: { logs: { type: 'file', filename: '/home/centos/webapp/logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');
const mysql = require('mysql');
require('dotenv').config({ path: '/home/centos/var/.env' });
const Config = require('./config/config');
const conf = new Config();

//mysql database connection
var con = mysql.createConnection({
    host     : conf.db.host,
    user     : conf.db.user,
    port 	 : '3306',
    password : conf.db.password,
    database : conf.db.database
});

con.connect(function (err) {
    if (err) {
        logger.fatal(err);
        throw err;
    }
    else {
            console.log("Connected!");
            logger.info('Connected to database!');
            var sql = `CREATE TABLE IF NOT EXISTS User(
            id varchar(36) NOT NULL,
            first_name varchar(45) NOT NULL,
            last_name varchar(45) NOT NULL,
            password varchar(100) NOT NULL COMMENT 'User Table updated',
            email_address varchar(320) NOT NULL,
            account_created datetime DEFAULT NULL,
            account_updated datetime DEFAULT NULL COMMENT 'User Table',
            PRIMARY KEY (id),
            UNIQUE KEY email_address_UNIQUE (email_address)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;
            con.query(sql, function (err, result) {
                    if (err) {
                        logger.fatal(err);
                        throw err;
                    }
                    else {
                            var sql1 = `CREATE TABLE IF NOT EXISTS Recipe (
                                    
                id varchar(36) NOT NULL COMMENT 'Creating Recipe',
                created_ts datetime NOT NULL,
                updated_ts datetime NOT NULL,
                author_id varchar(36) NOT NULL,
                cook_time_in_min int(11) NOT NULL,
                prep_time_in_min int(11) NOT NULL,
                total_time_in_min int(11) NOT NULL,
                title varchar(60) NOT NULL,
                cusine varchar(45) NOT NULL,
                servings int(11) NOT NULL,
                ingredients json NOT NULL,
                steps json NOT NULL,
                nutrition_information json NOT NULL,
                image json,
                metadata json,
                PRIMARY KEY (id),
                KEY fk_recipe_author_idx (author_id),
                CONSTRAINT fk_recipe_author FOREIGN KEY (author_id) REFERENCES User (id) ON DELETE NO ACTION ON UPDATE NO ACTION
              ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;

                                con.query(sql1, function (err, result) {
                                    if (err) {
                                        logger.fatal(err);
                                        throw err;
                                    }
                                    else {
                                        logger.info('Recipe Table checked!');
                                        console.log('Recipe Table checked!');
                                    }
                                });

                            }
                            logger.info('User Table checked!');
                            console.log("User Table checked!");
                        });
                    }
                    logger.info('Database checked!');
                    console.log("Database checked!");
         
    
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/v1/user', usersRouter);
app.use('/v1/recipe', recipeRouter);
app.use('/v2/recipes', recipeRouter);

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
