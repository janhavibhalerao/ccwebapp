const express = require('express');
const router = express.Router();
const validator = require('../services/validator');
const uuid = require('uuid');
const moment = require('moment');
const mysql = require('../services/db');
const checkUser = require('../services/auth');
const localTime = require('../services/localTime');
const { check, validationResult } = require('express-validator');

// Protected routes

router.put('/:id', checkUser.authenticate, validator.validateRecipe, (req, res) => {
    if (res.locals.user) {
        if (req.body.author_id != null || req.body.created_ts != null || req.body.updated_ts != null
            || req.body.id != null || req.body.total_time_in_min != null) {
            console.log("This is the issue");    
            return res.status(400).json();
        } else {

            mysql.query('select * from RMS.Recipe where id=(?)', [req.params.id], (err, result) => {
                if (result[0] != null) {
                    if (result[0].author_id === res.locals.user.id) {
                        let contentType = req.headers['content-type'];
                        if (contentType == 'application/json') {
                            let validationFail = validationResult(req);
                            if (!validationFail.isEmpty()) {
                                return res.status(400).json();
                            }
                            else {
                                let steps = req.body.steps;
                                let hi = 0;
                                let ordered = true;
                                let positionArr = [];

                                steps.forEach(element => {
                                    positionArr.push(element.position);
                                    if (element.position > hi) {
                                        hi = element.position
                                    }
                                });
                                if (new Set(positionArr).size !== positionArr.length) ordered = false;
                                else if (hi !== steps.length) ordered = false;

                                if (ordered) {
                                    let prepTime = parseInt(req.body.prep_time_in_min);
                                    let cookTime = parseInt(req.body.cook_time_in_min);
                                    let totalTimeForPrep = prepTime + cookTime;
                                    let updTimeStamp =  moment().format('YYYY-MM-DD HH:mm:ss');
                                    let crtTimeStamp = localTime(result[0].created_ts);
                                    mysql.query(`UPDATE RMS.Recipe SET 
                                cook_time_in_min =(?),
                                prep_time_in_min =(?), 
                                total_time_in_min=(?),
                                title=(?),
                                cusine=(?),
                                servings=(?),
                                ingredients=(?),
                                steps=(?),
                                nutrition_information=(?),
                                updated_ts=(?)
                                WHERE id = (?)`,
                                        [cookTime,
                                            prepTime,
                                            totalTimeForPrep,
                                            req.body.title,
                                            req.body.cusine,
                                            req.body.servings,
                                            JSON.stringify(req.body.ingredients),
                                            JSON.stringify(req.body.steps),
                                            JSON.stringify(req.body.nutrition_information),
                                            updTimeStamp,
                                            req.params.id],
                                        (err, results) => {
                                            if (err) {
                                                console.log(err);
                                                return res.status(404).json();
                                            }
                                            else {
                                                return res.json({
                                                    id: req.params.id,
                                                    created_ts: crtTimeStamp,
                                                    updated_ts: updTimeStamp,
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
                                        })
                                }
                                else {
                                    res.status(400).json();
                                }

                            }
                        }
                        else {
                            res.status(400).json();
                        }

                    } else {
                        return res.status(401).json();
                    }
                } else {
                    return res.status(404).json();
                }
            });
        }
    }
    else {
        res.status(401).json();
    }
});

router.post('/', checkUser.authenticate, validator.validateRecipe, (req, res, next) => {
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json();
        } else {
            let steps = req.body.steps;
            let hi = 0;
            let ordered = true;
            let positionArr = [];
            steps.forEach(element => {
                positionArr.push(element.position);
                if (element.position > hi) {
                    hi = element.position
                }
            });

            if (new Set(positionArr).size !== positionArr.length) ordered = false;
            else if (hi !== steps.length) ordered = false;
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
                            return res.status(400).json();
                        }
                        else {
                            return res.status(201).json({

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
                return res.status(400).json();
            }
        }
    } else {
        return res.status(400).json();
    }
});

// To get the user information
router.get('/:id', (req, res) => {
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        mysql.query('select * from RMS.Recipe where id=(?)', [req.params.id], (err, data) => {
            if (err) {
                return res.status(400).json();
            }
            else if (data[0] != null) {
                data[0].created_ts = localTime(data[0].created_ts);
                data[0].updated_ts = localTime(data[0].updated_ts);
                data[0].ingredients = JSON.parse(data[0].ingredients);
                data[0].steps = JSON.parse(data[0].steps);
                data[0].nutrition_information = JSON.parse(data[0].nutrition_information);
                return res.status(200).json(data[0]);
            } else {
                return res.status(404).json();
            }

        });
    } else {
        return res.status(400).json();
    }
});


//to delete the recipe 
router.delete('/:id', checkUser.authenticate, (req, res) => {
    if (res.locals.user) {
        mysql.query('select * from RMS.Recipe where id=(?)', [req.params.id], (err, result) => {
            if (result[0] != null) {
                if (result[0].author_id === res.locals.user.id) {
                    mysql.query('delete from RMS.Recipe where id=(?)', [req.params.id], (err, result) => {
                        if (err) {
                            return res.status(404).json();
                        } else {
                            return res.status(204).json();
                        }
                    });
                } else {
                    return res.status(401).json();
                }
            } else {
                return res.status(404).json();
            }
        });
    } else {
        return res.status(401).json();
    }
});



module.exports = router;    