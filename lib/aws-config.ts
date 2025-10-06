
import { S3Client } from "@aws-sdk/client-s3";

export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME,
    folderPrefix: process.env.AWS_FOLDER_PREFIX || ""
  };
}

export function createS3Client() {
  const region = process.env.AWS_REGION || "us-west-2";
  const endpoint = process.env.AWS_S3_ENDPOINT;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  const baseConfig: any = { region };
  if (endpoint) {
    baseConfig.endpoint = endpoint;
    baseConfig.forcePathStyle = true;
  }
  if (accessKeyId && secretAccessKey) {
    baseConfig.credentials = { accessKeyId, secretAccessKey };
  }

  return new S3Client(baseConfig);
}
