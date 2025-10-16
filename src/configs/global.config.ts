export const GLOBAL_CONFIG = {
  env: process.env.ENV,
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Nestjs Prisma Starter',
    description: 'The nestjs API description',
    version: '1.5',
  },
  security: {
    expiresIn: 3600 * 24, // 24h
    bcryptSaltOrRound: 10,
  },
  logger: {
    folder_path: process.env.LOG_FOLDER_PATH,
    level: process.env.LOG_LEVEL,
  },
  external: {
    frontend_url: process.env.FRONTEND_URL,
  },
  email: {
    enable_aws_ses: process.env.ENABLE_AWS_SES === 'true',
    from_email: process.env.EMAIL_FROM,
    server: {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
    },
  },
  prisma: {
    log_levels: process.env.PRISMA_LOG_LEVELS
      ? process.env.PRISMA_LOG_LEVELS.split(',')
      : [],
  },
  aws: {
    aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
    },
    region: process.env.AWS_REGION,
    cloudwatch_logger_enable:
      process.env.AWS_CLOUDWATCH_LOGGER_ENABLE === 'true',
    cloudwatch_log_group: process.env.AWS_CLOUDWATCH_LOG_GROUP,
  },
};
