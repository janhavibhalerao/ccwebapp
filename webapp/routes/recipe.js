const express = require('express');
const router = express.Router();
const validator = require('../services/validator');
const uuid = require('uuid');
const moment = require('moment');
const mysql = require('../services/db');
const checkUser = require('../services/auth');
const { check, validationResult } = require('express-validator');
const { upload, deleteFromS3, getMetaDataFromS3 } = require('../services/image');
const singleUpload = upload.single('image');
const config = require('./../config/config');
const { db: { database } } = config;
// Protected route: Update Recipe
router.put('/:id', checkUser.authenticate, validator.validateRecipe, (req, res) => {
    if (res.locals.user) {
        if (req.body.author_id != null || req.body.created_ts != null || req.body.updated_ts != null
            || req.body.id != null || req.body.total_time_in_min != null) {
            return res.status(400).json({ msg: 'Invalid Request body' });
        } else {

            mysql.query('select * from ' + database + '.Recipe where id=(?)', [req.params.id], (err, result) => {
                if (result[0] != null) {
                    if (result[0].author_id === res.locals.user.id) {
                        let contentType = req.headers['content-type'];
                        if (contentType == 'application/json') {
                            let validationFail = validationResult(req);
                            if (!validationFail.isEmpty()) {
                                return res.status(400).json({ msg: 'Validations failed' });
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
                                    let updTimeStamp = moment().format('YYYY-MM-DD HH:mm:ss');
                                    let crtTimeStamp = result[0].created_ts;
                                    mysql.query(`UPDATE ` + database + `.Recipe SET 
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
                                                return res.status(404).json({ msg: 'Not Found' });
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
                                    res.status(400).json({ msg: 'Invalid Recipe Steps' });
                                }

                            }
                        }
                        else {
                            res.status(400).json({ msg: 'Request type must be JSON!' });
                        }

                    } else {
                        return res.status(401).json({ msg: 'Unauthorized' });
                    }
                } else {
                    return res.status(404).json({ msg: 'Not Found' });
                }
            });
        }
    }
    else {
        res.status(401).json({ msg: 'Unauthorized' });
    }
});

//Protected Route: Create Recipe
router.post('/', checkUser.authenticate, validator.validateRecipe, (req, res, next) => {
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: 'Invalid request body' });
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
                mysql.query('insert into ' + database + '.Recipe(`id`,`created_ts`,`updated_ts`,`author_id`,`cook_time_in_min`,`prep_time_in_min`, `total_time_in_min`,`title`,`cusine`, `servings`,`ingredients`,`steps`,`nutrition_information`)values(?,?,?,?,?,?,?,?,?,?,?,?,?)'
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
                            return res.status(400).json({ msg: 'Inserting Recipes execution failed' });
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
                return res.status(400).json({ msg: 'Invalid steps for Recipe' });
            }
        }
    } else {
        return res.status(400).json({ msg: 'Request type must be JSON!' });
    }
});

// Get Recipe
router.get('/:id', (req, res) => {
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        mysql.query(`select 
        image,
        id,
        created_ts,
        updated_ts,
        author_id,
        cook_time_in_min,
        prep_time_in_min,
        total_time_in_min,
        title,
        cusine,
        servings,
        ingredients,
        steps,
        nutrition_information
        from ` + database + `.Recipe where id=(?)`, [req.params.id], (err, data) => {
            if (err) {
                return res.status(400).json({ msg: 'Fetching Recipe failed' });
            }
            else if (data[0] != null) {
                data[0].ingredients = JSON.parse(data[0].ingredients);
                data[0].steps = JSON.parse(data[0].steps);
                data[0].nutrition_information = JSON.parse(data[0].nutrition_information);
                if (data[0].image != null) {
                    data[0].image = JSON.parse(data[0].image);
                } else {
                    delete data[0]['image'];
                }
                return res.status(200).json(data[0]);
            } else {
                return res.status(404).json({ msg: 'Not Found' });
            }

        });
    } else {
        return res.status(400).json({ msg: 'Request type must be JSON!' });
    }
});


//Protected Route: Delete Recipe
router.delete('/:id', checkUser.authenticate, (req, res) => {
    if (res.locals.user) {
        mysql.query('select * from ' + database + '.Recipe where id=(?)', [req.params.id], (err, result) => {
            if (result[0] != null) {
                if (result[0].author_id === res.locals.user.id) {
                    if (result[0].image != null) {
                        result[0].image = JSON.parse(result[0].image);
                        let s3Id = result[0].image.url.split('/');
                        let imageId = s3Id[s3Id.length - 1];
                        deleteFromS3(imageId, function (resp) {
                            if (resp != null) {
                                mysql.query('delete from ' + database + '.Recipe where id=(?)', [req.params.id], (err, result) => {
                                    if (err) {
                                        return res.status(404).json({ msg: 'Not Found' });
                                    } else {
                                        return res.status(204).json();
                                    }
                                });
                            }
                        });
                    } else {
                        mysql.query('delete from ' + database + '.Recipe where id=(?)', [req.params.id], (err, result) => {
                            if (err) {
                                return res.status(404).json({ msg: 'Not Found' });
                            } else {
                                return res.status(204).json();
                            }
                        });
                    }
                } else {
                    return res.status(401).json({ msg: 'Unauthorized' });
                }
            } else {
                return res.status(404).json({ msg: 'Not Found' });
            }
        });
    } else {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
});

//Protected Route: Attach image to recipe
router.post('/:id/image', checkUser.authenticate, function (req, res, next) {
    mysql.query('select * from ' + database + '.Recipe where id=(?)', [req.params.id], (err, result) => {
        if (result[0] != null) {
            if (result[0].author_id === res.locals.user.id) {
                if (result[0].image != null) {
                    return res.status(400).json({ msg: 'Please delete the previous image before re-uploading' });
                } else {
                    singleUpload(req, res, (err) => {
                        if (err) {
                            return res.status(400).json({ msg: err });
                        } else {
                            let image = {
                                'id': uuid(),
                                'url': req.file.location
                            };
                            getMetaDataFromS3(function (metadata) {
                                if (metadata != null) {
                                    mysql.query(`UPDATE ` + database + `.Recipe SET image=(?), metadata=(?) where id=(?)`, [JSON.stringify(image), JSON.stringify(metadata), req.params.id], (err, result) => {
                                        if (!err) {
                                            return res.json(image);
                                        } else {
                                            return res.status(500).json({ msg: 'Some error while storing image data to DB' });
                                        }
                                    });
                                } else {
                                    return res.status(500).json({ msg: 'Issue in getting metadata' });
                                }

                            });
                        }
                    });

                }

            } else {
                return res.status(401).json({ msg: 'Unauthorized' });
            }
        } else {
            return res.status(404).json({ msg: 'Recipe Not Found' });
        }
    });

});

//Get recipe image
router.get('/:recipeId/image/:imageId', (req, res) => {
    mysql.query('select image from ' + database + '.Recipe where id=(?)', [req.params.recipeId], (err, data) => {
        if (data[0] != null) {
            if (data[0].image != null) {
                data[0].image = JSON.parse(data[0].image);
                if (req.params.imageId === data[0].image.id) {
                    return res.status(200).json(data[0]);
                } else {
                    return res.status(404).json({ msg: 'Image not found' });
                }
            } else {
                return res.status(404).json({ msg: 'Image not found!' });
            }
        } else {
            return res.status(404).json({ msg: 'Recipe Not Found!' });
        }
    });
});

//Protected Route:Delete recipe image
router.delete('/:recipeId/image/:imageId', checkUser.authenticate, (req, res) => {
    if (res.locals.user) {
        mysql.query('select image from ' + database + '.Recipe where id=(?)', [req.params.recipeId], (err, data) => {

            if (data[0] != null) {
                if (data[0].image != null) {

                    data[0].image = JSON.parse(data[0].image);

                    if (req.params.imageId === data[0].image.id) {
                        let s3Id = data[0].image.url.split('/');
                        let imageId = s3Id[s3Id.length - 1];

                        deleteFromS3(imageId, function (resp) {
                            if (resp != null) {
                                mysql.query(`UPDATE ` + database + `.Recipe SET image=(?), metadata=(?) where id=(?)`, [null, null, req.params.recipeId], (err, result) => {
                                    if (err) {
                                        return res.status(500).json({ msg: err });
                                    } else {
                                        return res.status(204).json();
                                    }
                                });
                            } else {
                                return res.status(500).json({ msg: 'Some error in deleting image. Please check permissions' });
                            }
                        });

                    } else {
                        return res.status(400).json({ msg: 'Image Not Found!' });
                    }
                }
                else {
                    return res.status(404).json({ msg: 'Image Not Found!' });
                }
            } else {
                return res.status(404).json({ msg: 'Image/Recipe Not Found!' });
            }
        });
    }
    else {
        return res.status(401).json({ msg: 'User unauthorized!' });
    }
});

//Get newest recipe
router.get('/', (req, res) => {
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        mysql.query(`select 
        image,
        id,
        created_ts,
        updated_ts,
        author_id,
        cook_time_in_min,
        prep_time_in_min,
        total_time_in_min,
        title,
        cusine,
        servings,
        ingredients,
        steps,
        nutrition_information
        from ` + database + `.Recipe where created_ts IN(SELECT MAX(created_ts)FROM ` + database + `.Recipe)`, (err, data) => {
            if (err) {
                return res.status(400).json({ msg: 'Fetching newest recipe failed!' });
            }
            else if (data[0] != null) {
                data[0].ingredients = JSON.parse(data[0].ingredients);
                data[0].steps = JSON.parse(data[0].steps);
                data[0].nutrition_information = JSON.parse(data[0].nutrition_information);
                if (data[0].image != null) {
                    data[0].image = JSON.parse(data[0].image);
                } else {
                    delete data[0]['image'];
                }
                return res.status(200).json(data[0]);
            } else {
                return res.status(404).json({ msg: 'Recipe Not Found' });
            }

        });
    } else {
        return res.status(400).json({ msg: 'Request type must be JSON!' });
    }
});

module.exports = router;    