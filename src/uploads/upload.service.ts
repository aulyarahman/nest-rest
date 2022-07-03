import { S3 } from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { ResUploadTypes } from './interface';
import { ConfigService } from '@nestjs/config';

interface DeleteImageTypes {
  key: string;
  bucket: 'customer' | 'mitra' | 'courier' | 'product';
}

interface UploadImageTypes {
  file: Buffer;
  bucket: 'customer' | 'mitra' | 'courier' | 'product';
  name: string;
}

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {}

  async bucketName(v: 'customer' | 'mitra' | 'courier' | 'product'): Promise<string> {
    return v === 'customer'
      ? this.configService.get('AWS_BUKCET_CUSTOMERS')
      : v === 'mitra'
      ? this.configService.get('AWS_MITRA_BUCKET')
      : v === 'courier'
      ? this.configService.get('AWS_COURIER_BUCKET')
      : v === 'product'
      ? this.configService.get('AWS_COURIER_BUCKET')
      : null;
  }

  async uploadImage(v: UploadImageTypes): Promise<ResUploadTypes> {
    const resBucketName = await this.bucketName(v.bucket);
    const s3 = this.getS3();
    const params = {
      Bucket: resBucketName,
      Key: String(v.name),
      Body: v.file
    };

    return new Promise<ResUploadTypes>((resolve, reject) => {
      s3.upload(params, (err: any, data) => {
        const _data = data as unknown as ResUploadTypes;
        if (err) reject(err.message);
        resolve(_data);
      });
    });
  }

  async deleteImage(v: DeleteImageTypes) {
    const resBucketName = await this.bucketName(v.bucket);
    const s3 = this.getS3();
    const params = {
      Bucket: resBucketName,
      Key: v.key
    };
    return new Promise((resolve, reject) => {
      s3.deleteObject({ ...params }, (err: any) => {
        if (err) reject(err.message);
        resolve('Success');
      });
    });
  }

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
  }
}
