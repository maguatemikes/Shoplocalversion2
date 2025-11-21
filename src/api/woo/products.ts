import axios from "axios";
import { mapWPProduct } from "../../lib/mapping";

// Base URL for public WooCommerce store API
const BASE_URL = "https://shoplocal.kinsta.cloud/wp-json/custom-api/v1";

// ------------------- Products -------------------

export const getProducts = async (page = 1, perPage = 12) => {
  try {
    const response = await axios.get(`${BASE_URL}/products`, {
      params: { page, per_page: perPage },
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    const mappedProducts = response.data.products.map(mapWPProduct);
    return { mapped: mappedProducts, res: response.data };

  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
};

export const getProductDetail = async (slug) => {
  try {
    const response = await axios.get(`${BASE_URL}/product/${slug}?gggg`, {
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    console.log("xtra", response.data);
    return response.data;

  } catch (error) {
    console.error("Failed to fetch product detail:", error);
    throw error;
  }
};

export const getShortProductDetail = async (slug) => {
  try {
    const response = await axios.get(`${BASE_URL}/product-short/${slug}?lll`, {
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    console.log("xtra", response.data);
    return response.data;

  } catch (error) {
    console.error("Failed to fetch product detail:", error);
    throw error;
  }
};

// ------------------- Nearby Vendors -------------------

export const getNearbyVendors = async (lat, lng, radius) => {
    console.log('entered detching vendorsdd');
  try {
    const response = await axios.get(`${BASE_URL}/vendors-nearby`, {
      params: { lat, lng, radius,}, // t=Date.now() to bust cache
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    return response.data;

  } catch (error) {
    console.error("Failed to fetch nearby vendors:", error);
    throw error;
  }
};
