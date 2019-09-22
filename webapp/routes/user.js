const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const checkUser = require('../services/validator');

// protected routes
router.put('/self', authUser);
router.get('/self', authUser);


function authUser(req, res, next) {
     res.sendStatus(200);
     
}


module.exports = router;
