const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3();
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.BUCKET_NAME;

aws.config.update({
    secretAccessKey: AWS_SECRET_KEY,
    accessKeyId: AWS_ACCESS_KEY,
    region: AWS_REGION
});
let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: S3_BUCKET_NAME,
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
        Bucket: S3_BUCKET_NAME,
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