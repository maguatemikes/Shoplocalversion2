    // WPProduct mirrors the final object structure including brand and UPC
interface WPProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  vendor: string;
  vendorSlug: string;
  category: string;
  brand: string;
  upc?: string; // added UPC
  description: string;
  tags: string[];
  acceptsOffers: boolean;
  isNew: boolean;
  isTrending: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  colors: string[];
  [key: string]: any; // allow extra fields
}

// MappedProduct identical to WPProduct
interface MappedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  vendor: string;
  vendorSlug: string;
  category: string;
  brand: string;
  upc?: string; // added UPC
  description: string;
  tags: string[];
  acceptsOffers: boolean;
  isNew: boolean;
  isTrending: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  colors: string[];
}

// Mapping function ensures defaults and safe access
export const mapWPProduct = (wpProduct: Partial<WPProduct>): MappedProduct => {
  return {
    id: wpProduct.id ?? "0",
    name: wpProduct.name ?? "Unnamed Product",
    slug: wpProduct.slug ?? "",
    price: wpProduct.price ?? 0,
    originalPrice: wpProduct.originalPrice ?? wpProduct.price ?? 0,
    image: wpProduct.image ?? "",
    vendor: wpProduct.vendor ?? "Default Vendor",
    vendorSlug: wpProduct.vendorSlug ?? "default-vendor",
    category: wpProduct.category ?? "Uncategorized",
    brand: wpProduct.brand ?? "Unknown Brand",
    upc: wpProduct.upc ?? "", // set UPC
    description: wpProduct.description ?? "",
    tags: wpProduct.tags ?? [],
    acceptsOffers: wpProduct.acceptsOffers ?? true,
    isNew: wpProduct.isNew ?? true,
    isTrending: wpProduct.isTrending ?? true,
    rating: wpProduct.rating ?? 0,
    reviewCount: wpProduct.reviewCount ?? 0,
    stock: wpProduct.stock ?? 0,
    colors: wpProduct.colors ?? ["#000000"],
  };
};
