export class BasePaginationResponseDto<T> {
  items: T[];
  totalItems: number;
  currentPage?: number;
  allItems?: number;

  constructor(partial: Partial<BasePaginationResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static convertToPaginationResponse(
    data: [any[], number],
    currentPage?: number,
    allItems?: number,
  ) {
    return {
      items: data[0],
      totalItems: data[1],
      currentPage,
      allItems,
    };
  }
}
