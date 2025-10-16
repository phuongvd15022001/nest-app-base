import { GLOBAL_CONFIG } from 'src/configs/global.config';
import { Environment } from '../constants/global.constants';

export const isDev = () => {
  return GLOBAL_CONFIG.env === Environment.Development;
};

export const isProd = () => {
  return GLOBAL_CONFIG.env === Environment.Production;
};

export const isTest = () => {
  return GLOBAL_CONFIG.env === Environment.Test;
};
