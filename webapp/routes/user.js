const express = require('express');
const router = express.Router();
const emailValidator = require('email-validator');
const validator = require('../services/validator');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const moment = require('moment');
const mysql = require('../services/db');
const saltRounds = 10;
const checkUser = require('../services/auth');
require('dotenv').config({ path: '/home/centos/webapp/var/.env' });
const SDC = require('statsd-client'),
sdc = new SDC({host: 'localhost'});
const log4js = require('log4js');
	log4js.configure({
	  appenders: { logs: { type: 'file', filename: '/home/centos/webapp/logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');


// protected routes

// To update the user information
router.put('/self', checkUser.authenticate, (req, res) => {
     if (res.locals.user) {
          if (Object.keys(req.body).length > 0) {
               let contentType = req.headers['content-type'];
               if (contentType == 'application/json') {
                    let id = req.body.id;
                    let password = req.body.password;
                    let email_address = req.body.email_address;
                    let account_created = req.body.account_created;
                    let account_updated = req.body.account_updated;
                    if (password != null && validator.schema.validate(password)) {
                         let hashedPassword = bcrypt.hashSync(password, 10);
                         req.body.password = hashedPassword;
                    } else if (password != null) {
                         return res.status(400).json({
                              msg: 'Password must be: atleast 8 letters & should contain an uppercase, a lowercase, a digit & a symbol! No spaces allowed'
                         });
                    }
                    if (id != null || email_address != null || account_created != null || account_updated != null) {
                         return res.status(400).json({ msg: 'Invalid request body' });
                    } else {
                         let update_set = Object.keys(req.body).map(value => {
                              return ` ${value}  = "${req.body[value]}"`;
                         });
                         mysql.query(`UPDATE User SET ${update_set.join(" ,")}, account_updated=(?) WHERE email_address = (?)`, [moment().format('YYYY-MM-DD HH:mm:ss'), res.locals.user.email_address], function (error, results) {
                              if (error) {
                                   return res.status(400).json({ msg: "Update query execution failed" });
                              } else {
                                   return res.status(204).json();
                              }
                         });
                    }
               } else {
                    return res.status(400).json({ msg: 'Request type must be JSON!' });
               }
          } else {
               return res.status(400).json({ msg: 'Bad Request' });
          }
     } else {
          return res.status(401).json({ msg: 'Unauthorized' });
     }
});

// To get the user information
router.get('/self', checkUser.authenticate, (req, res) => {
     if (res.locals.user) {
          res.statusCode = 200;
          res.locals.user.account_created = res.locals.user.account_created;
          res.locals.user.account_updated = res.locals.user.account_updated;
          res.setHeader('Content-Type', 'application/json');
          res.json(res.locals.user);
     }
});



router.post('/', (req, res, next) => {
     let contentType = req.headers['content-type'];
     if (contentType == 'application/json') {
          let first_name = req.body.first_name;
          let last_name = req.body.last_name;
          let password = req.body.password;
          let email_address = req.body.email_address;


          if (first_name != null && last_name != null && password != null && email_address != null && validator.schema.validate(password) == true && emailValidator.validate(email_address) == true) {
               let salt = bcrypt.genSaltSync(saltRounds);
               let hashedPassword = bcrypt.hashSync(password, salt);
               const id = uuid();
               const account_created = moment().format('YYYY-MM-DD HH:mm:ss');
               const account_updated = moment().format('YYYY-MM-DD HH:mm:ss');

               mysql.query('insert into User(`id`,`first_name`,`last_name`,`password`,`email_address`,`account_created`,`account_updated`)values(?,?,?,?,?,?,?)',
                    [id, first_name, last_name, hashedPassword, email_address, account_created, account_updated], (err, result) => {
                         if (err) {
                              return res.status(400).json({ msg: ` Email: ${email_address} already exists!` });
                         }
                         else {
                              return res.status(201).json({
                                   id: id,
                                   first_name: first_name,
                                   last_name: last_name,
                                   email_address: email_address,
                                   account_created: account_created,
                                   account_updated: account_updated
                              });
                         }
                    });
          }
          else if (first_name == null || last_name == null || password == null || email_address == null) {
               return res.status(400).json({ msg: 'Please enter all details!' });
          }
          else if (emailValidator.validate(email_address) == false) {
               return res.status(400).json({ msg: `${email_address} is not a valid email!` });
          }
          else {
               return res.status(400).json({
                    msg: 'Password must be: atleast 8 letters & should contain an uppercase, a lowercase, a digit & a symbol! No spaces allowed'
               });
          }
     }
     else {
          return res.status(400).json({ msg: 'Request type must be JSON!' });
     }
});

module.exports = router;
