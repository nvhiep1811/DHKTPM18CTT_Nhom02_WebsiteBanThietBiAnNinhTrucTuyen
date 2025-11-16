export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
}

export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  listedPrice: number;
  price: number;
  thumbnailUrl: string;
  inStock: boolean;
  availableStock?: number;
  category: CategorySummary;
  brand?: Brand;
  rating: number;
  reviewCount: number;
}

export interface CategorySummary {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  listedPrice: number;
  price: number;
  active: boolean;
  brand: Brand;
  category: CategorySummary;
  shortDesc: string;
  longDesc: string;
  thumbnailUrl: string;
  rating: number;
  reviewCount: number;
  mediaAssets: MediaAsset[];
  availableStock: number;
  inStock: boolean;
  reviews: Review[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null;
  features: string[];
  specifications: Record<string, string>;
}

export interface Inventory {
  onHand: number;
  reserved: number;
  inStock: boolean;
}

export interface MediaAsset {
  id?: string;
  url?: string;
  altText?: string;
}

export interface Review {
  id?: string;
  userName?: string;
  rating?: number;
  comment?: string;
  date?: string;
  verified?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

// Export VNPay types
export * from './vnpay';
