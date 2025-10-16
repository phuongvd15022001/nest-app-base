import { BasePaginationDto } from '../dtos/base-pagination.dto';

const transformPaginationQuery = (
  query: BasePaginationDto,
  scalarFieldEnum?: object,
) => {
  const sortByField =
    query.sortBy && Object.keys(scalarFieldEnum ?? {}).includes(query.sortBy)
      ? { [query.sortBy]: query.direction || 'asc' }
      : undefined;

  return {
    take: query.limit || undefined,
    skip:
      query.page && query.limit ? (query.page - 1) * query.limit : undefined,
    sortByField,
  };
};

const formatMessageString = (str: string, ...args: unknown[]): string => {
  return `${str}`.replace(
    /\{(\d+)}/g,
    (match, index) => (args[Number(index)] || match) as string,
  );
};

export const CommonHelpers = {
  transformPaginationQuery,
  formatMessageString,
};
