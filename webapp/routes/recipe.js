const express = require('express');
const router = express.Router();
const validator = require('../services/validator');
const uuid = require('uuid');
const moment = require('moment');
const mysql = require('../services/db');
const checkUser = require('../services/auth');
const { check, validationResult } = require('express-validator');

// Protected route
router.post('/', checkUser.authenticate, validator.validateRecipe, (req, res, next)=>{
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Bad Request' });
    }else{
        
    }
});

module.exports = router;    