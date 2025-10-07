/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AuthHelpers } from 'src/shared/helpers/auth.helpers';

const onCreated = async (params, next): Promise<any> => {
  if (params.model == 'User') {
    if (params.action === 'create') {
      const password = params.args['data'].password;

      const encryptedPass = await AuthHelpers.hash(password);

      params.args['data'] = {
        ...params.args['data'],
        password: encryptedPass,
      };
    }
  }

  return next(params);
};

export const UserListener = {
  onCreated,
};
