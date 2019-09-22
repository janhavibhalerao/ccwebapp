const express = require('express');
const router = express.Router();
const emailValidator = require('email-validator');
const validator = require('../services/validator');
const bcrypt = require('bcrypt');
// mysql = require('../../services/db');

router.post('/', (req, res, next) => {

   /* res.status(200).json({
        message: 'hadling testpost'
    });*/


    var contentType = req.headers['content-type'];

    if (contentType == 'application/json') {
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var password = req.body.password;
        var email_address = req.body.email_address;
        var hashedPassword = bcrypt.hashSync(password, 10);

        if (first_name != null && last_name != null && password != null && email_address != null && validator.validate(password) == true && emailValidator.validate(email_address) == true) {
            mysql.query('Insert into users(email_address, password) values(?,?);', [email_address, hashedPassword], (err, result) => {
                if (err) {
                    res.status(409).json({ msg: ` Email${email_address} already exists!` });
                }
                else {
                    res.status(200).json(`New user has been created successfully!Created email: ${email_address}`);
                }
            });
        }
        else if (first_name == null || last_name == null || password == null || email_address == null ) {
            res.status(400).json({ msg: 'Please enter all details!' });
        }
        else if (emailValidator.validate(email_address) == false) {
            res.status(400).json({ msg: `${email_address} is not a valid email` });
        }

        else {
            res.status(400).json({
                msg: 'password must be atleast 9 letters \
        and should contain an uppercase, lowercase, digits and symbols. Also should \
        not contain spaces'});
        }
    }
    else {
        res.status(400).json({ msg: 'Request type must be json' });
    }
});


router.get('/self', (req, res, next) => {
    res.status(200).json({
        message: 'getting users',
        user: 'info'
    });


    /*mysql.query('SELECT * FROM users', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'users list.' });
    });*/
});


router.put('/self',(req, res, next) =>  {
    let user = req.body.user;
    if (!!user) {
        return res.status(400).send({ error: user, message: 'Please provide user detils' });
    }
  
    /*mysql.query("UPDATE users SET user = ? WHERE id = ?", [users], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'User has been updated successfully!' });
    });*/
});

module.exports = router;