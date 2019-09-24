const express = require('express');
const router = express.Router();
const emailValidator = require('email-validator');
const validator = require('../services/validator');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const moment = require('moment');
const mysql = require('../services/db');
const saltRounds = 10;

router.post('/', (req, res, next) => {
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let password = req.body.password;
        let email_address = req.body.email_address;
        let salt = bcrypt.genSaltSync(saltRounds);
        let hashedPassword = bcrypt.hashSync(password, salt);

        if (first_name != null && last_name != null && password != null && email_address != null && validator.validate(password) == true && emailValidator.validate(email_address) == true) {
            const id = uuid();
            const account_created = moment().format('YYYY-MM-DD HH:mm:ss');
            const account_updated = moment().format('YYYY-MM-DD HH:mm:ss');

            mysql.query('insert into RMS.User(`id`,`first_name`,`last_name`,`password`,`email_address`,`account_created`,`account_updated`)values(?,?,?,?,?,?,?)',
                [id, first_name, last_name, hashedPassword, email_address, account_created, account_updated], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json({ msg: ` Email: ${email_address} already exists!` });
                    }
                    else {
                        //res.status(201).json(`User created successfully!Created email: ${email_address}`);
                        res.status(201).json({
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
            res.status(400).json({ msg: 'Please enter all details!' });
        }
        else if (emailValidator.validate(email_address) == false) {
            res.status(400).json({ msg: `${email_address} is not a valid email!` });
        }
        else {
            res.status(400).json({
                msg: 'Password must be: atleast 8 letters & should contain an uppercase, a lowercase, a digit & a symbol! No spaces allowed'
            });
        }
    }
    else {
        res.status(400).json({ msg: 'Request type must be JSON!' });
    }
});
module.exports = router;