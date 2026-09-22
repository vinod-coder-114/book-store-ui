export type BookPricing = {
  currency: string;
  salePrice: number;
  listPrice: number;
};

export type BookRating = {
  average: number;
  count: number;
};

export type BookImage = {
  id: string;
  downloadUrl: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  displayOrder: number;
  primary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  format: string;
  pricing: BookPricing;
  rating: BookRating;
  images: BookImage[];
  stock: number;
};
