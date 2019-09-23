const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const validator = require('../services/validator');
const checkUser = require('../services/auth');
const mysql = require('../services/db');

// protected routes
// router.put('/self', checkUser.authenticate, (req, res) => {
//      if (res.locals.user) {
//          if (Object.keys(req.body).length>0) {
//                let contentType = req.headers['content-type'];
//                if (contentType == 'application/json') {
//                     let id = req.body.id;
//                     let first_name = req.body.first_name;
//                     let last_name = req.body.last_name;
//                     let password = req.body.password;
//                     let email_address = req.body.email_address;
//                     let account_created = req.body.account_created;
//                     let account_updated = req.body.account_updated;
//                     if (password != null && validator.validate(password)) {
//                          let hashedPassword = bcrypt.hashSync(password, 10);
//                          req.body.password = hashedPassword;
//                          if (id != null || email_address != null || account_created != null || account_updated != null) {
//                               res.status(400).json({ msg: 'Bad Request' });
//                          } else {
//                               for (const col of req.body) {
//                                    colsToUpdate[col.name] = col.value;
//                               }

//                               mysql.query('UPDATE RMS.User SET ? WHERE email_address = (?)',[{ colsToUpdate },res.locals.email_address], function (error, results) {
//                                    if (error) {
//                                         res.status(404).json({
//                                              message: error,
//                                              field: fieldsToUpdate
//                                         });
//                                    } else {
//                                         res.status(201).json({
//                                              "record_count": results.length,
//                                              "error": null,
//                                              "response": results
//                                         });
//                                    }
//                               });
//                          }
//                     } else {

//                     }
//                } else {
//                     res.status(400).json({ msg: 'Bad Request' });
//                }
//           } else {
//                 res.status(204).json({ msg: 'No Content found' });
//           }
//      } else {
//           res.status(401).json({ msg: 'Unauthorized' });
//      }
// });

router.get('/self', checkUser.authenticate, (req, res) => {
     if (res.locals.user) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(res.locals.user);

     }
});

module.exports = router;
