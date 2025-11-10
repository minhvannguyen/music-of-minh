export interface Genre {
  id: number;
  name: string;
  slug: string;
}

// Response types cho Genre API
export interface GetGenresResponse {
  success: boolean;
  message: string;
  data: Genre[];
}
