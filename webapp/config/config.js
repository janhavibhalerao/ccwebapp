

module.exports = function() {
    return {
        "db": {
            "host": process.env.NODE_DB_HOST,
            "user": process.env.NODE_DB_USER,
            "password": process.env.NODE_DB_PASS,
            "database": "csye6225"
        },
        "image": {
            "imageBucket": process.env.NODE_S3_BUCKET
        }
    }
};

