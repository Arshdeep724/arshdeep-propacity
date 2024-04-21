import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});

export const uploadFileS3 = (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: file.originalname,
    Body: file.buffer,
  };
  let fileLocation;
  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading file:",err.message);
    } else {
      fileLocation = data.Location;
      console.log(`File uploaded successfully. ${data.Location}`);
    }
  });
  return fileLocation;
};
