const express = require('express');
const router = express.Router();
const validator = require('../services/validator');
const bcrypt = require('bcrypt');
const moment = require('moment');
const mysql = require('../services/db');
const checkUser = require('../services/auth');

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
                    if (password != null && validator.validate(password)) {
                         let hashedPassword = bcrypt.hashSync(password, 10);
                         req.body.password = hashedPassword;
                    } else if(password!=null) {
                         return res.status(400).json({ msg: 'Bad Request' });
                    }
                    if (id != null || email_address != null || account_created != null || account_updated != null) {
                         return res.status(400).json({ msg: 'Bad Request' });
                    } else {
                         let update_set = Object.keys(req.body).map(value => {
                              return ` ${value}  = "${req.body[value]}"`;
                         });
                         mysql.query(`UPDATE RMS.User SET ${update_set.join(" ,")}, account_updated=(?) WHERE email_address = (?)`, [moment().format('YYYY-MM-DD HH:mm:ss'), res.locals.user.email_address], function (error, results) {
                              if (error) {
                                   return res.status(400).json({ msg: 'Bad Request' });
                              } else {
                                   res.status(204).json();
                              }
                         });
                    }
               } else {
                    res.status(400).json({ msg: 'Bad Request' });
               }
          } else {
               res.status(400).json({ msg: 'Bad Request' });
          }
     } else {
          res.status(401).json({ msg: 'Unauthorized' });
     }
});

// To get the user information
router.get('/self', checkUser.authenticate, (req, res) => {
     if (res.locals.user) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(res.locals.user);

     }
});

module.exports = router;
