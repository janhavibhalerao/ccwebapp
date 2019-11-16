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
require('dotenv').config({ path: '/home/centos/var/.env' });
const SDC = require('statsd-client'),
    sdc = new SDC({ host: 'localhost', port: 8125 });
const log4js = require('log4js');
log4js.configure({
    appenders: { logs: { type: 'file', filename: '/home/centos/webapp/logs/webapp.log' } },
    categories: { default: { appenders: ['logs'], level: 'info' } }
});
const logger = log4js.getLogger('logs');
const aws = require('aws-sdk');



// Protected route: Update Recipe
router.put('/:id', checkUser.authenticate, validator.validateRecipe, (req, res) => {
    sdc.increment('Put Recipe Triggered');
    let timer = new Date();
    if (res.locals.user) {
        if (req.body.author_id != null || req.body.created_ts != null || req.body.updated_ts != null
            || req.body.id != null || req.body.total_time_in_min != null) {
            logger.error('Invalid Request body');
            return res.status(400).json({ msg: 'Invalid Request body' });
        } else {
            let dbtimer = new Date();
            mysql.query('select * from Recipe where id=(?)', [req.params.id], (err, result) => {
                if (result[0] != null) {
                    if (result[0].author_id === res.locals.user.id) {
                        let contentType = req.headers['content-type'];
                        if (contentType == 'application/json') {
                            let validationFail = validationResult(req);
                            if (!validationFail.isEmpty()) {
                                logger.error('Invalid Request body');
                                return res.status(400).json({ msg: 'Invalid Request Body' });
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
                                    mysql.query(`UPDATE Recipe SET 
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
                                                logger.fatal(err);
                                                return res.status(500).json({ msg: err });
                                            }
                                            else {
                                                logger.info('Updated Recipe Successfully');
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
                                        });
                                    sdc.timing('put.recipedb.time', dbtimer);
                                }
                                else {
                                    logger.error('Invalid Recipe Steps');
                                    res.status(400).json({ msg: 'Invalid Recipe Steps' });
                                }

                            }
                        }
                        else {
                            logger.error('Request type must be JSON');
                            res.status(400).json({ msg: 'Request type must be JSON!' });
                        }

                    } else {
                        logger.error('UnAuthorized Access');
                        return res.status(401).json({ msg: 'Unauthorized' });
                    }
                } else {
                    logger.error('Recipe details not found');
                    return res.status(404).json({ msg: 'Recipe details not found' });
                }
            });
        }
    }
    else {
        logger.error('UnAuthorized Access');
        res.status(401).json({ msg: 'Unauthorized' });
    }
    sdc.timing('put.recipe.time', timer);
});

//Protected Route: Create Recipe
router.post('/', checkUser.authenticate, validator.validateRecipe, (req, res, next) => {
    sdc.increment('POST Recipe Triggered');
    let timer = new Date();
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error('Invalid Request Body');
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
                let dbtimer = new Date();
                mysql.query('insert into Recipe(`id`,`created_ts`,`updated_ts`,`author_id`,`cook_time_in_min`,`prep_time_in_min`, `total_time_in_min`,`title`,`cusine`, `servings`,`ingredients`,`steps`,`nutrition_information`)values(?,?,?,?,?,?,?,?,?,?,?,?,?)'
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
                            logger.fatal(err);
                            return res.status(500).json({ msg: 'Inserting Recipes execution failed' });
                        }
                        else {
                            logger.info('Created Recipe Successfully');
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
                sdc.timing('post.recipedb.time', dbtimer);
            } else {
                logger.error('Invalid steps for Recipe');
                return res.status(400).json({ msg: 'Invalid steps for Recipe' });
            }
        }
    } else {
        logger.error('Request type must be JSON');
        return res.status(400).json({ msg: 'Request type must be JSON!' });
    }
    sdc.timing('post.recipe.time', timer);
});

// Get Recipe
router.get('/:id', (req, res) => {
    sdc.increment('GET Recipe Triggered');
    let timer = new Date();
    let contentType = req.headers['content-type'];
    if (contentType == 'application/json') {
        let dbtimer = new Date();
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
        from Recipe where id=(?)`, [req.params.id], (err, data) => {
            if (err) {
                logger.fatal(err);
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
                logger.error('Recipe Not Found');
                return res.status(404).json({ msg: 'Not Found' });
            }

        });
        sdc.timing('get.recipedb.time', dbtimer);
    } else {
        logger.error('Request type must be JSON');
        return res.status(400).json({ msg: 'Request type must be JSON!' });
    }
    sdc.timing('get.recipe.time', timer);
});


//Protected Route: Delete Recipe
router.delete('/:id', checkUser.authenticate, (req, res) => {
    sdc.increment('DELETE Recipe Triggered');
    let timer = new Date();
    if (res.locals.user) {
        let dbtimer = new Date();
        mysql.query('select * from Recipe where id=(?)', [req.params.id], (err, result) => {
            if (result[0] != null) {
                if (result[0].author_id === res.locals.user.id) {
                    if (result[0].image != null) {
                        result[0].image = JSON.parse(result[0].image);
                        let s3Id = result[0].image.url.split('/');
                        let imageId = s3Id[s3Id.length - 1];
                        let s3timer = new Date();
                        deleteFromS3(imageId, function (resp) {
                            sdc.timing('deletefromS3.recipeImage.time', s3timer);
                            if (resp != null) {
                                mysql.query('delete from Recipe where id=(?)', [req.params.id], (err, result) => {
                                    if (err) {
                                        logger.error(err);
                                        return res.status(404).json({ msg: 'Not Found' });
                                    } else {
                                        logger.info('Recipe Deleted Successfully');
                                        return res.status(204).json();
                                    }
                                });
                                sdc.timing('delete.recipedb.time', dbtimer);
                            }
                        });
                    } else {
                        mysql.query('delete from Recipe where id=(?)', [req.params.id], (err, result) => {
                            if (err) {
                                logger.error(err);
                                return res.status(404).json({ msg: 'Not Found' });
                            } else {
                                logger.info('Recipe Deleted Successfully');
                                return res.status(204).json();
                            }
                        });
                        sdc.timing('delete.recipedb.time', dbtimer);
                    }
                } else {
                    logger.error('UnAuthorized');
                    return res.status(401).json({ msg: 'Unauthorized' });
                }
            } else {
                logger.error('Recipe Not found');
                return res.status(404).json({ msg: 'Recipe Not Found' });
            }
        });
    } else {
        logger.error('UnAuthorized');
        return res.status(401).json({ msg: 'Unauthorized' });
    }
    sdc.timing('delete.recipe.time', timer);
});

//Protected Route: Attach image to recipe
router.post('/:id/image', checkUser.authenticate, function (req, res, next) {
    sdc.increment('POST Image for Recipe Triggered');
    let timer = new Date();
    let dbtimer = new Date();
    mysql.query('select * from Recipe where id=(?)', [req.params.id], (err, result) => {
        if (result[0] != null) {
            if (result[0].author_id === res.locals.user.id) {
                if (result[0].image != null) {
                    return res.status(400).json({ msg: 'Please delete the previous image before re-uploading' });
                } else {
                    let s3timer = new Date();
                    singleUpload(req, res, (err) => {
                        if (err) {
                            logger.error(err);
                            return res.status(400).json({ msg: err });
                        } else {
                            if (req.file == null) {
                                logger.error('Invalid Request Body');
                                return res.status(400).json({ msg: 'Invalid Request body' });
                            } else {
                                let image = {
                                    'id': uuid(),
                                    'url': req.file.location
                                };
                                getMetaDataFromS3(function (metadata) {
                                    sdc.timing('uploadToS3.recipeImage.time', s3timer);
                                    if (metadata != null) {
                                        mysql.query(`UPDATE Recipe SET image=(?), metadata=(?) where id=(?)`, [JSON.stringify(image), JSON.stringify(metadata), req.params.id], (err, result) => {
                                            if (!err) {
                                                return res.json(image);
                                            } else {
                                                logger.fatal(err);
                                                return res.status(500).json({ msg: 'Some error while storing image data to DB' });
                                            }
                                        });
                                        sdc.timing('post.recipeImagedb.time', dbtimer);
                                    } else {
                                        logger.fatal('Issue in getting metadata');
                                        return res.status(500).json({ msg: 'Issue in getting metadata' });
                                    }

                                });
                            }
                        }
                    });

                }

            } else {
                logger.error('UnAuthorized');
                return res.status(401).json({ msg: 'Unauthorized' });
            }
        } else {
            logger.error('Recipe Not Found');
            return res.status(404).json({ msg: 'Recipe Not Found' });
        }
    });
    sdc.timing('post.recipeImage.time', timer);
});

//Get recipe image
router.get('/:recipeId/image/:imageId', (req, res) => {
    sdc.increment('GET Recipe Image Triggered');
    let timer = new Date();
    mysql.query('select image from Recipe where id=(?)', [req.params.recipeId], (err, data) => {
        sdc.timing('get.recipeImagedb.time', timer);
        if (data[0] != null) {
            if (data[0].image != null) {
                data[0].image = JSON.parse(data[0].image);
                if (req.params.imageId === data[0].image.id) {
                    return res.status(200).json(data[0]);
                } else {
                    logger.error('Image not found');
                    return res.status(404).json({ msg: 'Image not found' });
                }
            } else {
                logger.error('Image not found');
                return res.status(404).json({ msg: 'Image not found!' });
            }
        } else {
            logger.error('Recipe Not Found');
            return res.status(404).json({ msg: 'Recipe Not Found!' });
        }
    });
    sdc.timing('get.recipeImage.time', timer);
});

//Protected Route:Delete recipe image
router.delete('/:recipeId/image/:imageId', checkUser.authenticate, (req, res) => {
    sdc.increment('DELETE Recipe Image Triggered');
    let timer = new Date();
    if (res.locals.user) {
        mysql.query('select image from Recipe where id=(?)', [req.params.recipeId], (err, data) => {

            if (data[0] != null) {
                if (data[0].image != null) {

                    data[0].image = JSON.parse(data[0].image);

                    if (req.params.imageId === data[0].image.id) {
                        let s3Id = data[0].image.url.split('/');
                        let imageId = s3Id[s3Id.length - 1];
                        let s3timer = new Date();
                        deleteFromS3(imageId, function (resp) {
                            sdc.timing('deletefromS3.recipeImage.time', s3timer);
                            if (resp != null) {
                                mysql.query(`UPDATE Recipe SET image=(?), metadata=(?) where id=(?)`, [null, null, req.params.recipeId], (err, result) => {
                                    if (err) {
                                        logger.fatal(err);
                                        return res.status(500).json({ msg: err });
                                    } else {
                                        logger.info('Recipe details updated successfully');
                                        return res.status(204).json();
                                    }
                                });
                                sdc.timing('Delete.recipeImagedb.time', timer);
                            } else {
                                logger.error('Some error in deleting image. Please check permissions');
                                return res.status(400).json({ msg: 'Some error in deleting image. Please check permissions' });
                            }
                        });

                    } else {
                        logger.error('Image Not Found!');
                        return res.status(400).json({ msg: 'Image Not Found!' });
                    }
                }
                else {
                    logger.error('Image Not Found!');
                    return res.status(404).json({ msg: 'Image Not Found!' });
                }
            } else {
                logger.error('Image/Recipe Not Found!');
                return res.status(404).json({ msg: 'Image/Recipe Not Found!' });
            }
        });
    }
    else {
        logger.error('User Unauthorized');
        return res.status(401).json({ msg: 'User unauthorized!' });
    }
    sdc.timing('Delete.recipeImage.time', timer);
});

//Get newest recipe
router.get('/', (req, res) => {
    sdc.increment('GET Newest Recipe Triggered');
    let timer = new Date();
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
        from Recipe where created_ts IN(SELECT MAX(created_ts) FROM Recipe)`, (err, data) => {
            sdc.timing('get.NewestRecipedb.time', timer);
            if (err) {
                logger.error(err);
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
                logger.info('Newest Recipe Returned');
                return res.status(200).json(data[0]);
            } else {
                logger.error('Recipe Not Found');
                return res.status(404).json({ msg: 'Recipe Not Found' });
            }

        });
    } else {
        logger.error('Request type must be JSON');
        return res.status(400).json({ msg: 'Request type must be JSON!' });
    }
    sdc.timing('Get.NewestRecipe.time', timer);
});

//Protected Route:Request link to all of my recipes
router.post('/myrecipes', checkUser.authenticate, (req, res) => {
    sdc.increment('POST myrecipes Triggered');
    if (res.locals.user) {
        //let recipeIds = [];
        let topic = {};
        let ARN;
        aws.config.update({ region: 'us-east-1' });
        let sns = new aws.SNS();
        let header = req.headers['authorization'] || '',
            token = header.split(/\s+/).pop() || '',
            auth = new Buffer.from(token, 'base64').toString(),
            parts = auth.split(/:/),
            email = parts[0];

        mysql.query(`select id from User where email_address=(?)`, [email], (err, data) => {
            if (err) {
                logger.error('Failed to get author_id from email!', err);
                return res.status(400).json({ msg: 'Failed to get author_id from email!' });
            }
            else {
                mysql.query(`select id from Recipe where author_id=(?)`, [data[0].id], (err, result) => {
                    if (result != null) {
                        sns.listTopics(topic, (err, data) => {
                            if (err) {
                                logger.error('err in sns listTopics', err);
                                res.status(400).json({ msg: 'err in sns listTopics' });
                            }
                            else {
                                ARN = data.Topics[0].TopicArn;
                                //currently sending only 1 recipe
                                let params = {
                                    TopicArn: ARN,
                                    MessageStructure: 'json',
                                    Message: JSON.stringify({
                                        "default": JSON.stringify(result),
                                        "email": JSON.stringify(email),
                                        "recipeIds": result[0].id
                                    })
                                };

                                sns.publish(params, (err, data) => {
                                    if (err) {
                                        logger.error('error in SNS publish',err);
                                        res.status(400).json({ msg: 'error in SNS publish' });
                                    } else {
                                        logger.info('Request recieved!')
                                        console.log('SNS publish success', data);
                                        return res.status(200).json({ msg: 'Request recieved!' });
                                    }
                                })
                            }
                        })
                    }
                    else {
                        logger.error('User doesnt have any recipes!', err);
                        return res.status(201).json({ msg: 'User doesnt have any recipes!' });
                    }

                });

            }
        });
    }
    else {
        logger.error('User unauthorized!')
        return res.status(401).json({ msg: 'User unauthorized!' });
    }
});

module.exports = router;    