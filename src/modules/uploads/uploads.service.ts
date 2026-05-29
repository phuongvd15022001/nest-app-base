import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  handleImageUpload(file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully',
      filename: file.originalname,
      path: `/uploads/images/${file.filename}`,
    };
  }
}
