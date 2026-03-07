export interface PaginatedData<T> {
  total: number;
  page: number;
  pageSize: number;
  data: T[];
}
