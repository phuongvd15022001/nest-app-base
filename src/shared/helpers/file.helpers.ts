import { BadRequestException } from '@nestjs/common';

import { IMAGE_MIME_TYPES } from '../constants/global.constants';
import { MESSAGES } from '../constants/message.constants';
import { CommonHelpers } from './common.helpers';

export const checkImageType = (file: Express.Multer.File) => {
  if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(MESSAGES.INVALID_IMAGE);
  }

  return file;
};

export const checkFileSize = (
  file: Express.Multer.File,
  maximumFileSizeInMB: number,
) => {
  const fileSize = file.size * 0.000001; // MB

  if (fileSize > maximumFileSizeInMB) {
    throw new BadRequestException(
      CommonHelpers.formatMessageString(
        MESSAGES.INVALID_IMAGE_SIZE,
        `${maximumFileSizeInMB}MB`,
      ),
    );
  }

  return file;
};
