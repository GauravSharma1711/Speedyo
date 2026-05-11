// lib/storage/uploadFile.ts
// ─── Swap this file's internals for AWS S3 later without touching any route ───

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
  url: string;
}

export async function uploadFile(
  file: File | Buffer,
  folder: string = "uploads"
): Promise<UploadResult> {
  let buffer: Buffer;
  let fileName: string;

  if (Buffer.isBuffer(file)) {
    buffer = file;
    fileName = `${uuidv4()}.webp`;
  } else {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() ?? "jpg";
    fileName = `${uuidv4()}.${ext}`;
  }

  const uploadDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const url = `/${folder}/${fileName}`;
  return { url };
}

// ─── When switching to AWS S3, replace the body of uploadFile with: ───────────
//
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
//
// const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });
//
// export async function uploadFile(file: File, folder = "uploads"): Promise<UploadResult> {
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);
//   const ext = file.name.split(".").pop() ?? "jpg";
//   const fileName = `${uuidv4()}.${ext}`;
//   const key = `${folder}/${fileName}`;
//
//   await s3.send(new PutObjectCommand({
//     Bucket: process.env.AWS_BUCKET_NAME!,
//     Key: key,
//     Body: buffer,
//     ContentType: file.type,
//   }));
//
//   const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//   return { url };
// }