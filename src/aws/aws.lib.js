import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: "AKIA5ILPRBUPHXOB7VRL",
  secretAccessKey: "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",
});

export const uploadFileS3 = (file) => {
  const params = {
    Bucket: "test-bucket-arshdeep",
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
