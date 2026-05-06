export interface Product {
  id: number;
  name: string;
  category: string;
  categorySlug: string;
  sku: string;
  description: string;
  images: string[];
  specs: {
    label: string;
    value: string;
  }[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
}
