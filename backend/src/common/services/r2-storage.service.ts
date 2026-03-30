import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
// NOTE: Install if not present — npm i @aws-sdk/s3-request-presigner
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2StorageService implements OnModuleInit {
  private readonly logger = new Logger(R2StorageService.name);
  private s3Client!: S3Client;
  private bucketPrivate!: string;
  private bucketPublic!: string;
  private publicUrl!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const accountId = this.configService.get<string>('r2.accountId');
    const accessKey = this.configService.get<string>('r2.accessKey');
    const secretKey = this.configService.get<string>('r2.secretKey');

    this.bucketPrivate = this.configService.get<string>('r2.bucketPrivate')!;
    this.bucketPublic = this.configService.get<string>('r2.bucketPublic')!;
    this.publicUrl = this.configService.get<string>('r2.publicUrl')!;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey || '',
        secretAccessKey: secretKey || '',
      },
    });

    this.logger.log('R2 storage client initialized');
  }

  /**
   * Resolve the actual bucket name from the alias.
   */
  private resolveBucket(bucket: 'private' | 'public'): string {
    return bucket === 'private' ? this.bucketPrivate : this.bucketPublic;
  }

  /**
   * Upload a file to R2.
   * For public bucket, the bucket itself is configured as public in R2 dashboard.
   * Returns the full URL: signed URL for private, public URL for public.
   *
   * Key format for media: `media/{ulid}/{filename}`
   */
  async upload(
    bucket: 'private' | 'public',
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const bucketName = this.resolveBucket(bucket);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    this.logger.log(`Uploaded ${key} to ${bucketName}`);

    if (bucket === 'public') {
      return this.getPublicUrl(key);
    }

    return this.getSignedUrl(key);
  }

  /**
   * Generate a pre-signed URL for a private bucket object.
   * @param key - Object key in the private bucket
   * @param expiresIn - Expiration in seconds (default 3600 = 1 hour)
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketPrivate,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    return url;
  }

  /**
   * Download a file from R2 as a Buffer.
   * Used by image processor to fetch originals for processing.
   */
  async download(bucket: 'private' | 'public', key: string): Promise<Buffer> {
    const bucketName = this.resolveBucket(bucket);

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    if (!response.Body) {
      throw new Error(`Empty response body for key: ${key}`);
    }

    // Convert readable stream to Buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as NodeJS.ReadableStream;
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }

    this.logger.log(`Downloaded ${key} from ${bucketName}`);

    return Buffer.concat(chunks);
  }

  /**
   * Delete an object from R2.
   */
  async delete(bucket: 'private' | 'public', key: string): Promise<void> {
    const bucketName = this.resolveBucket(bucket);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await this.s3Client.send(command);

    this.logger.log(`Deleted ${key} from ${bucketName}`);
  }

  /**
   * Build the public URL for an object in the public bucket.
   * Relies on R2_PUBLIC_URL env var (e.g. https://cdn.bhquan.site).
   */
  getPublicUrl(key: string): string {
    const base = this.publicUrl.replace(/\/+$/, '');
    return `${base}/${key}`;
  }
}
