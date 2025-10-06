
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, getBucketConfig } from "./aws-config";

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  const s3Client = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME não configurado');
  }

  // Normalize prefix to avoid duplicate slashes and segment duplication
  const normalizedPrefix = (folderPrefix || '')
    .replace(/^\/+/, '')      // trim leading slashes
    .replace(/\/+$/, '');     // trim trailing slashes
  const hasUploadsSuffix = normalizedPrefix ? /(^|\/)uploads$/.test(normalizedPrefix) : false;
  const keyPrefix = normalizedPrefix
    ? (hasUploadsSuffix ? normalizedPrefix : `${normalizedPrefix}/uploads`)
    : 'uploads';
  const key = `${keyPrefix}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: getContentType(fileName),
  });

  await s3Client.send(command);
  return key;
}

export async function downloadFile(key: string): Promise<string> {
  const s3Client = createS3Client();
  const { bucketName } = getBucketConfig();
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME não configurado');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  const s3Client = createS3Client();
  const { bucketName } = getBucketConfig();
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME não configurado');
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}
