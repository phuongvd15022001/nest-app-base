export const JWT_SECRET = process.env.JWT_SECRET;

export enum ERole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export const SHORT_DATE = 'YYYY-MM-DD';

export const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];
