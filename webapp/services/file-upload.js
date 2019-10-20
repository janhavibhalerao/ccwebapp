const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3();

aws.config.update({
    secretAccessKey: "",
    accessKeyId: "",
    region: "us-east-1"
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'webapp.ravi-pilla.me',
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

module.exports = upload;
