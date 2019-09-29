const express = require('express');
const router = express.Router();
const validator = require('../services/validator');
const uuid = require('uuid');
const moment = require('moment');
const mysql = require('../services/db');
const checkUser = require('../services/auth');
const { check, validationResult } = require('express-validator');

// Protected route
router.post('/', checkUser.authenticate, validator.validateRecipe, (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendStatus(400);
    } else {
        let steps = req.body.steps;
        let prev = 0;
        let ordered = true;
        steps.forEach(element => {
            if (element.position !== prev + 1) {
                ordered = false;
            }
            prev = element.position;

        });

        if (ordered) {
            let prepTime = parseInt(req.body.prep_time_in_min);
            let cookTime = parseInt(req.body.cook_time_in_min);
            let totalTimeForPrep = prepTime + cookTime;
            let id = uuid();
            let timeStamp = moment().format('YYYY-MM-DD HH:mm:ss');
            mysql.query('insert into RMS.Recipe(`id`,`created_ts`,`updated_ts`,`author_id`,`cook_time_in_min`,`prep_time_in_min`, `total_time_in_min`,`title`,`cusine`, `servings`,`ingredients`,`steps`,`nutrition_information`)values(?,?,?,?,?,?,?,?,?,?,?,?,?)'
                , [id, timeStamp, timeStamp,
                    res.locals.user.id,
                    prepTime,
                    cookTime,
                    totalTimeForPrep,
                    req.body.title,
                    req.body.cusine,
                    req.body.servings,
                    JSON.stringify(req.body.ingredients),
                    JSON.stringify(req.body.steps),
                    JSON.stringify(req.body.nutrition_information)
                ], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(400);
                    }
                    else {
                        res.status(201).json({

                            id: id,
                            created_ts: timeStamp,
                            updated_ts: timeStamp,
                            author_id: res.locals.user.id,
                            cook_time_in_min: cookTime,
                            prep_time_in_min: prepTime,
                            total_time_in_min: totalTimeForPrep,
                            title: req.body.title,
                            cusine: req.body.cusine,
                            servings: req.body.servings,
                            ingredients: req.body.ingredients,
                            steps: req.body.steps,
                            nutrition_information: req.body.nutrition_information
                        });
                    }
                });
        } else {
            return res.sendStatus(400);
        }
    }
});

// To get the user information
router.get('/:id', checkUser.authenticate, (req, res) => {
    if (res.locals.user) {
        mysql.query('select * from RMS.Recipe where author_id = (?) and id=(?)', [res.locals.user.id, req.params.id], (err, data) => {
            if (data[0] != null) {
                data[0].ingredients = JSON.parse(data[0].ingredients);
                data[0].steps = JSON.parse(data[0].steps);
                data[0].nutrition_information = JSON.parse(data[0].nutrition_information);
                return res.status(200).json(data[0]);
            } else {
                return res.sendStatus(400);
            }
        });

    } else {
        return res.sendStatus(401);
    }
});

module.exports = router;    