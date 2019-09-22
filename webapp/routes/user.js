const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const checkUser = require('../services/auth');
const myDb = require('../services/db');

// protected routes
router.put('/self', checkUser.authenticate, (req, res) => {
     let user = res.locals.user
     if(user) {
          myDb.updateUser(user.username);
        
   } else if(err) {
        res.json({ err: err });
   }
});

router.get('/self', checkUser.authenticate, (req, res) => {
    if(res.locals.user) {

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(res.locals.user);
          
     } else if(err) {
          res.json({ err: err });
     }
});


module.exports = router;
