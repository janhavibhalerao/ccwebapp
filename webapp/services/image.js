const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config({ path: '/home/centos/webapp/var/.env' });
const Config = require('../config/config');
const conf = new Config();
var SDC = require('statsd-client'),
    sdc = new SDC({ host: 'localhost' });
const log4js = require('log4js');
log4js.configure({
    appenders: { logs: { type: 'file', filename: '/home/centos/webapp/logs/webapp.log' } },
    categories: { default: { appenders: ['logs'], level: 'info' } }
});
const logger = log4js.getLogger('logs');

console.log("---- process env -----", process.env);

//global common variables
var imageDir = conf.image.imageBucket;
console.log("conf ------", conf, "++++++++++++++");

var metadata = new aws.MetadataService();
function getEC2Credentials(rolename) {
    var promise = new Promise((resolve, reject) => {
        metadata.request('/latest/meta-data/iam/security-credentials/' + rolename, function (err, data) {
            if (err) {
                logger.fatal(err);
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });

    return promise;
};

const s3 = new aws.S3();
getEC2Credentials('CodeDeployEC2ServiceRole').then((credentials) => {
    console.log("\n----- credentials ------", credentials);
    aws.config.accessKeyId = credentials.AccessKeyId;
    aws.config.secretAccessKey = credentials.SecretAccessKey;
    aws.config.sessionToken = credentials.Token;
}).catch((err) => {
    logger.fatal(err);
    console.log("\n-----errrrr------", err);
});


// aws.config.update({
//     secretAccessKey: aws_secret_key,
//     accessKeyId: aws_access_key,
//     region: aws_region
// });

// const s3 = new aws.S3();


let objId;
let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: imageDir,
        key: function (req, file, cb) {
            let filetypes = /jpeg|jpg|png/;
            let mimetype = filetypes.test(file.mimetype);
            if (mimetype) {
                let fileName = file.originalname.replace(/\s/g, '');
                objId = fileName + '_' + Date.now().toString();
                cb(null, objId);
            } else {
                cb("Error: File upload only supports the following filetypes - " + filetypes);

            }
        }
    })
});

function deleteFromS3(imageId, cb) {
    var params = {
        Bucket: imageDir,
        Key: imageId
    };
    s3.deleteObject(params, function (err, data) {
        if (data) {
            cb(data);
        }
        else {
            cb(null);
        }
    });
}

function getMetaDataFromS3(cb) {
    var params = {
        Bucket: imageDir,
        Key: objId
    };
    s3.headObject(params, function (err, data) {
        if (err) {
            cb(null);
        }
        else {
            cb(data);
        }
    });
}

module.exports = {
    upload,
    deleteFromS3,
    getMetaDataFromS3
}