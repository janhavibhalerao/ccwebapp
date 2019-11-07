// const config = { 
//     aws: { 
//         aws_secret_key: 'MnP1XI/WasYCx1aDPdG6Wcu9LgiZeEoroTy9q94O', 
//         aws_access_key: 'AKIAQE3UTL67KRCBHN5T', 
//         aws_region: 'us-east-1', 
//         s3_bucket_name: 'webapp.janhavibhalerao.me' 
//     }, 
//     mysql: { 
//         host: "localhost", 
//         user: "root", 
//         password: "Admin@123", 
//         database: "RMS" 
//     }, 
//     db: {
//         host: "csye6225-fall2019.cebvhwtrbewj.us-east-1.rds.amazonaws.com",
//         user: "dbuser",
//         password: "Admin_123",
//         port: "3306",
//         database: "csye6225"

//     },
//         port: 3000 
//     }; 
// module.exports = config;

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

