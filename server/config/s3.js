const { S3Client } = require("@aws-sdk/client-s3");

let _s3Client = null;

const getS3Client = () => {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _s3Client;
};

module.exports = getS3Client;
