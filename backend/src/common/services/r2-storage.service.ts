import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class R2StorageService implements OnModuleInit {
  private readonly logger = new Logger(R2StorageService.name);
  private s3Client!: S3Client;
  private bucketPrivate!: string;
  private bucketPublic!: string;
  private publicUrl!: string;

  /** Nếu R2 chưa config → fallback lưu file local */
  private useLocal = false;
  private localDir = path.resolve(process.cwd(), 'uploads');

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const endpoint = this.configService.get<string>('r2.endpoint');
    const accountId = this.configService.get<string>('r2.accountId');
    const accessKey = this.configService.get<string>('r2.accessKey');
    const secretKey = this.configService.get<string>('r2.secretKey');

    this.bucketPrivate = this.configService.get<string>('r2.bucketPrivate')!;
    this.bucketPublic = this.configService.get<string>('r2.bucketPublic')!;
    this.publicUrl = this.configService.get<string>('r2.publicUrl')!;

    // Cần ít nhất accessKey + secretKey + (endpoint hoặc accountId)
    const resolvedEndpoint = endpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');

    if (!accessKey || !secretKey || !resolvedEndpoint) {
      this.useLocal = true;
      fs.mkdirSync(this.localDir, { recursive: true });
      this.logger.warn(
        'R2 credentials not configured — using local file storage at ' + this.localDir,
      );
      return;
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: resolvedEndpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    this.logger.log('R2 storage client initialized (endpoint: ' + resolvedEndpoint + ')');
  }

  private resolveBucket(bucket: 'private' | 'public'): string {
    return bucket === 'private' ? this.bucketPrivate : this.bucketPublic;
  }

  async upload(
    bucket: 'private' | 'public',
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    // Local fallback — lưu vào disk
    if (this.useLocal) {
      const filePath = path.resolve(this.localDir, key);
      if (!filePath.startsWith(this.localDir)) {
        throw new Error('Invalid storage key');
      }
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, body);
      this.logger.log(`[Local] Saved ${key} (${body.length} bytes)`);
      // Trả URL dạng /uploads/... để Nginx hoặc Express static serve
      return `/uploads/${key}`;
    }

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

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.useLocal) {
      return `/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketPrivate,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async download(bucket: 'private' | 'public', key: string): Promise<Buffer> {
    if (this.useLocal) {
      const filePath = path.resolve(this.localDir, key);
      if (!filePath.startsWith(this.localDir)) {
        throw new Error('Invalid storage key');
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`Local file not found: ${key}`);
      }
      return fs.readFileSync(filePath);
    }

    const bucketName = this.resolveBucket(bucket);
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    if (!response.Body) {
      throw new Error(`Empty response body for key: ${key}`);
    }

    const chunks: Uint8Array[] = [];
    const stream = response.Body as NodeJS.ReadableStream;
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }

    this.logger.log(`Downloaded ${key} from ${bucketName}`);
    return Buffer.concat(chunks);
  }

  async delete(bucket: 'private' | 'public', key: string): Promise<void> {
    if (this.useLocal) {
      const filePath = path.resolve(this.localDir, key);
      if (!filePath.startsWith(this.localDir)) {
        throw new Error('Invalid storage key');
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`[Local] Deleted ${key}`);
      }
      return;
    }

    const bucketName = this.resolveBucket(bucket);
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
    this.logger.log(`Deleted ${key} from ${bucketName}`);
  }

  getPublicUrl(key: string): string {
    if (this.useLocal) {
      return `/uploads/${key}`;
    }
    const base = this.publicUrl.replace(/\/+$/, '');
    return `${base}/${key}`;
  }
}
