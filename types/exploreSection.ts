
export interface ExploreSection<T> {
    title: string;
    items: T[];
    slug: string,
    showViewAll?: boolean;
  }