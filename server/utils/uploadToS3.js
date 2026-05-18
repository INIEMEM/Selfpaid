const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { v4: uuid } = require("uuid");
const getS3Client = require("../config/s3");

const getMimeExtension = (mimetype) => {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mimetype] || "jpg";
};

const uploadToS3 = async ({ buffer, mimetype, folder }) => {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const ext = getMimeExtension(mimetype);
  const filename = `${uuid()}-${Date.now()}`;
  const key = `${folder}/${filename}.${ext}`;

  const upload = new Upload({
    client: getS3Client(),
    params: {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    },
  });

  await upload.done();

  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return url;
};

const deleteFromS3 = async (fileUrl) => {
  try {
    const bucket = process.env.AWS_S3_BUCKET;
    const urlParts = new URL(fileUrl);
    const key = urlParts.pathname.slice(1); // remove leading /

    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Failed to delete file from S3:", error.message);
  }
};

module.exports = { uploadToS3, deleteFromS3 };
