import { Environment } from 'src/shared/constants/global.constants';

export const GLOBAL_CONFIG = {
  env: (process.env.NODE_ENV as Environment) ?? Environment.Development,
  frontendUrl: process.env.FRONTEND_URL,
};
