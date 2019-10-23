const config = require('./../config/config');
const { aws: { aws_secret_key, aws_access_key, aws_region, s3_bucket_name } } = config;
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3();

aws.config.update({
    secretAccessKey: aws_secret_key,
    accessKeyId: aws_access_key,
    region: aws_region
});
let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: s3_bucket_name,
        key: function (req, file, cb) {
            var filetypes = /jpeg|jpg|png/;
            var mimetype = filetypes.test(file.mimetype);
            if (mimetype) {
                console.log("Hey here");
                cb(null, file.originalname + '_' + Date.now().toString());
            } else {
                cb("Error: File upload only supports the following filetypes - " + filetypes);

            }
        }
    })
});

function deleteFromS3(imageId) {
    var params = {
        Bucket: s3_bucket_name,
        Key: imageId
    };
    s3.deleteObject(params, function (err, data) {
        if (data) {
            console.log("File deleted from S3 successfully!");
        }
        else {
            console.log("Check if you have sufficient permissions : " + err);
        }
    });
}

module.exports = {
    upload,
    deleteFromS3
}