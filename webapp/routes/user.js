const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const checkUser = require('../services/auth');

// protected routes
router.put('/self', checkUser.authenticate);

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
