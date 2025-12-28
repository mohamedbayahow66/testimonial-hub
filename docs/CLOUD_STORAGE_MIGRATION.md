# Cloud Storage Migration Guide

This document outlines how to migrate from local file storage to cloud storage providers like AWS S3 or Cloudinary for testimonial media files.

## Current Implementation

The MVP uses local file storage with the following structure:

```
/public/uploads/testimonials/
  └── [userId]/
      └── [timestamp]-[uuid].[ext]
```

Files are served directly from the public directory via Next.js.

## Why Migrate to Cloud Storage?

1. **Scalability**: Local storage is limited by server disk space
2. **Performance**: CDN delivery for faster global access
3. **Reliability**: Built-in redundancy and backup
4. **Cost**: Pay only for what you use
5. **Security**: Fine-grained access control

## Migration Options

### Option 1: AWS S3 + CloudFront

**Pros**: Industry standard, highly scalable, excellent CDN integration
**Cons**: More complex setup, pay-as-you-go can get expensive at scale

#### Implementation Steps:

1. Install AWS SDK:
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

2. Create S3 bucket with configuration:
   - Enable versioning (optional, for recovery)
   - Set up CORS for direct uploads
   - Configure bucket policy for public read access (for media)

3. Update environment variables:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your-bucket-name
   AWS_CLOUDFRONT_URL=https://your-distribution.cloudfront.net
   ```

4. Update `lib/upload.ts`:

   ```typescript
   import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

   const s3Client = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     },
   });

   export async function saveFile(
     file: Buffer,
     userId: string,
     originalFilename: string
   ): Promise<UploadResult> {
     const filename = generateUniqueFilename(originalFilename);
     const key = `testimonials/${userId}/${filename}`;

     await s3Client.send(new PutObjectCommand({
       Bucket: process.env.AWS_S3_BUCKET!,
       Key: key,
       Body: file,
       ContentType: getMimeType(filename),
     }));

     return {
       success: true,
       url: `${process.env.AWS_CLOUDFRONT_URL}/${key}`,
       filename,
     };
   }
   ```

### Option 2: Cloudinary

**Pros**: Easy setup, built-in transformations, free tier available
**Cons**: Less control, potential vendor lock-in

#### Implementation Steps:

1. Install Cloudinary SDK:
   ```bash
   npm install cloudinary
   ```

2. Update environment variables:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Update `lib/upload.ts`:

   ```typescript
   import { v2 as cloudinary } from "cloudinary";

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export async function saveFile(
     file: Buffer,
     userId: string,
     originalFilename: string
   ): Promise<UploadResult> {
     const filename = generateUniqueFilename(originalFilename);
     
     const result = await new Promise((resolve, reject) => {
       cloudinary.uploader.upload_stream(
         {
           folder: `testimonials/${userId}`,
           public_id: filename.replace(/\.[^/.]+$/, ""),
           resource_type: "auto",
         },
         (error, result) => {
           if (error) reject(error);
           else resolve(result);
         }
       ).end(file);
     });

     return {
       success: true,
       url: result.secure_url,
       filename,
     };
   }
   ```

### Option 3: Vercel Blob Storage

**Pros**: Seamless Vercel integration, simple API, built-in CDN
**Cons**: Vercel-specific, newer service

#### Implementation Steps:

1. Install Vercel Blob:
   ```bash
   npm install @vercel/blob
   ```

2. Set up in Vercel dashboard and get token

3. Update `lib/upload.ts`:

   ```typescript
   import { put, del } from "@vercel/blob";

   export async function saveFile(
     file: File | Buffer,
     userId: string,
     originalFilename: string
   ): Promise<UploadResult> {
     const filename = generateUniqueFilename(originalFilename);
     const pathname = `testimonials/${userId}/${filename}`;

     const blob = await put(pathname, file, {
       access: "public",
     });

     return {
       success: true,
       url: blob.url,
       filename,
     };
   }
   ```

## Data Migration

To migrate existing local files to cloud storage:

1. Create a migration script:

   ```typescript
   // scripts/migrate-to-cloud.ts
   import fs from "fs";
   import path from "path";
   import { db } from "@/lib/db";
   import { saveFileToCloud } from "@/lib/cloud-upload";

   async function migrateFiles() {
     const testimonials = await db.testimonial.findMany({
       where: { mediaUrl: { startsWith: "/uploads/" } },
     });

     for (const testimonial of testimonials) {
       const localPath = path.join(process.cwd(), "public", testimonial.mediaUrl!);
       
       if (fs.existsSync(localPath)) {
         const file = fs.readFileSync(localPath);
         const result = await saveFileToCloud(
           file,
           testimonial.userId,
           path.basename(testimonial.mediaUrl!)
         );
         
         await db.testimonial.update({
           where: { id: testimonial.id },
           data: { mediaUrl: result.url },
         });
         
         console.log(`Migrated: ${testimonial.id}`);
       }
     }
   }

   migrateFiles();
   ```

2. Run migration:
   ```bash
   npx tsx scripts/migrate-to-cloud.ts
   ```

3. After verification, remove local files:
   ```bash
   rm -rf public/uploads/testimonials/
   ```

## Security Considerations

1. **Signed URLs**: For private media, use signed URLs with expiration
2. **File Validation**: Always validate files on both client and server
3. **Size Limits**: Set appropriate limits in cloud provider settings
4. **Access Control**: Use IAM roles/policies for server access
5. **CORS**: Configure CORS for direct browser uploads

## Cost Estimation

### AWS S3
- Storage: ~$0.023/GB/month
- Requests: ~$0.005 per 1,000 requests
- Data Transfer: ~$0.09/GB (first 10TB)

### Cloudinary
- Free tier: 25 credits/month
- Plus: $89/month for 225 credits
- Credit = 1 transformation or 1GB bandwidth

### Vercel Blob
- Included in Pro plan
- Pay-as-you-go: $0.15/GB stored, $0.30/GB transferred

## Recommended Approach

For most use cases, we recommend:

1. **Small scale (<1000 files)**: Continue with local storage
2. **Medium scale**: Vercel Blob (if on Vercel) or Cloudinary
3. **Large scale**: AWS S3 with CloudFront

Start with the simplest solution that meets your needs and migrate when necessary.

