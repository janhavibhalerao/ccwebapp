const config = require('./../config/config');
const { aws: { aws_secret_key, aws_access_key, aws_region, s3_bucket_name } } = config;
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
aws.config.update({
    secretAccessKey: aws_secret_key,
    accessKeyId: aws_access_key,
    region: aws_region
});
const s3 = new aws.S3();
let objId;


let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: s3_bucket_name,
        key: function (req, file, cb) {
            let filetypes = /jpeg|jpg|png/;
            let mimetype = filetypes.test(file.mimetype);
            if (mimetype) {
                let fileName = file.originalname.replace(/\s/g,'');
                console.log(fileName);
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
        Bucket: s3_bucket_name,
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
        Bucket: s3_bucket_name,
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