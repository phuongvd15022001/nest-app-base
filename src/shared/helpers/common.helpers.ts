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

export const CommonHelpers = {
  transformPaginationQuery,
};
