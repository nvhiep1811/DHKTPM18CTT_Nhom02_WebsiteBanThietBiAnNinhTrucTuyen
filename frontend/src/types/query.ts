export interface ProductQueryParams {
  active?: boolean;
  categoryId?: number;
  brandId?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface BrandQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}
